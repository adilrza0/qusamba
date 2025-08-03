const axios = require('axios');
const crypto = require('crypto');

class ShiprocketService {
  constructor() {
    this.baseURL = 'https://apiv2.shiprocket.in/v1/external';
    this.authToken = null;
    this.tokenExpiry = null;
    
    // Store credentials securely - these should be in environment variables
    this.credentials = {
      email: process.env.SHIPROCKET_EMAIL || 'qusamb@gmail.com',
      password: process.env.SHIPROCKET_PASSWORD || 'zTjYYckIDco$4uAZ'
    };
    
    // Pickup address configuration
    this.pickupAddress = {
      company_name: 'Qusamba Creations',
      name: 'adil',
      address: 'p4 174, sultanpuri',
      address_2: '',
      city: 'New Delhi',
      state: 'Delhi',
      country: 'India',
      pin_code: 110086,
      phone: 8882578260,
      email: 'qusamba0@gmail.com'
    };
  }

  // Authenticate with Shiprocket API
  async authenticate() {
    try {
      if (this.authToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
        return this.authToken;
      }

      const response = await axios.post(`${this.baseURL}/auth/login`, {
        email: this.credentials.email,
        password: this.credentials.password
      });
      console.log('Shiprocket authentication response:', response.data);
      if (response.data && response.data.token) {
        this.authToken = response.data.token;
        // Token typically expires in 24 hours, set expiry to 23 hours
        this.tokenExpiry = Date.now() + (23 * 60 * 60 * 1000);
        return this.authToken;
      } else {
        throw new Error('Failed to authenticate with Shiprocket');
      }
    } catch (error) {
      console.error('Shiprocket authentication error:', error.response?.data || error.message);
      throw new Error('Shiprocket authentication failed');
    }
  }

  // Get authenticated headers
  async getHeaders() {
    const token = await this.authenticate();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  // Create order in Shiprocket
  async createOrder(orderData) {
    try {
      const headers = await this.getHeaders();
      
      const shiprocketOrder = {
        order_id: orderData.orderNumber,
        order_date: orderData.placedAt || new Date().toISOString(),
        pickup_location: "Home",
        billing_customer_name: `${orderData.shippingAddress.firstName} ${orderData.shippingAddress.lastName}`,
        billing_last_name: orderData.shippingAddress.lastName,
        billing_address: orderData.shippingAddress.address,
        billing_city: orderData.shippingAddress.city,
        billing_pincode: orderData.shippingAddress.zipCode,
        billing_state: orderData.shippingAddress.state,
        billing_country: orderData.shippingAddress.country,
        billing_email: orderData.user?.email || orderData.guestEmail,
        billing_phone: orderData.shippingAddress.phone,
        shipping_is_billing: 1,
        order_items: orderData.items.map(item => ({
          name: item.name,
          sku: item.sku || `SKU_${item.product}`,
          units: item.quantity,
          selling_price: item.salePrice || item.price,
          discount: item.price - (item.salePrice || item.price),
          tax: '',
          hsn: ''
        })),
        payment_method: orderData.payment?.method === 'razorpay' ? 'Prepaid' : 'COD',
        shipping_charges: orderData.shippingCost || 0,
        giftwrap_charges: 0,
        transaction_charges: 0,
        total_discount: orderData.discount?.amount || 0,
        sub_total: orderData.subtotal,
        // Use calculated dimensions from order or fallback to defaults
        length: orderData.shipping?.dimensions?.length || 10,
        breadth: orderData.shipping?.dimensions?.breadth || 10,
        height: orderData.shipping?.dimensions?.height || 10,
        weight: orderData.shipping?.weight || 0.5
      };
    

      const response = await axios.post(
        `${this.baseURL}/orders/create/adhoc`,
        shiprocketOrder,
        { headers }
      );
     
      console.log('Shiprocket order creation response:', {
        status: response.status,
        data: response.data
      });
      if (response.data && response.data.order_id) {
        const orderResult = {
          success: true,
          shiprocket_order_id: response.data.order_id,
          shipment_id: response.data.shipment_id,
          awb_code: response.data.awb_code,
          courier_company_id: response.data.courier_company_id,
          courier_name: response.data.courier_name
        };
        
        // If AWB is not generated automatically, try to generate it
        if (!response.data.awb_code && response.data.shipment_id) {
          console.log('AWB not generated automatically, attempting to generate AWB for shipment:', response.data.shipment_id);
          
          try {
            // First get available couriers for this shipment
            const serviceabilityUrl = `${this.baseURL}/courier/serviceability/?pickup_postcode=${this.pickupAddress.pin_code}&delivery_postcode=${orderData.shippingAddress.zipCode}&cod=0&weight=${orderData.shipping?.weight || 0.5}`;
            console.log('Checking courier serviceability:', serviceabilityUrl);
            
            const couriersResponse = await axios.get(serviceabilityUrl, { headers });
            
            console.log('Courier serviceability response:', {
              status: couriersResponse.status,
              data: couriersResponse.data
            });
            
            if (couriersResponse.data && couriersResponse.data.data && couriersResponse.data.data.available_courier_companies.length > 0) {
              const availableCouriers = couriersResponse.data.data.available_courier_companies;
              const recommendedCourierId = couriersResponse.data.data.recommended_courier_company_id;
              
              console.log('Available couriers:', availableCouriers.map(c => ({
                id: c.courier_company_id,
                name: c.courier_name,
                rate: c.rate,
                cod: c.cod
              })));
              console.log('Recommended courier ID:', recommendedCourierId);
              
              // Use the recommended courier or first available courier
              const recommendedCourier = availableCouriers.find(
                c => c.courier_company_id === recommendedCourierId
              ) || availableCouriers[0];
              
              console.log('Using courier for AWB generation:', {
                id: recommendedCourier.courier_company_id,
                name: recommendedCourier.courier_name,
                rate: recommendedCourier.rate
              });
              
              // Generate AWB
              const awbResult = await this.generateAWB(response.data.shipment_id, recommendedCourier.courier_company_id);
              console.log('AWB generation result:', awbResult);
              
              if (awbResult.success) {
                orderResult.awb_code = awbResult.awb_code;
                orderResult.courier_company_id = recommendedCourier.courier_company_id;
                orderResult.courier_name = awbResult.courier_name || recommendedCourier.courier_name;
                console.log('AWB generated successfully:', awbResult.awb_code);
              } else {
                console.warn('Failed to generate AWB, but order created successfully');
              }
            } else {
              console.warn('No available couriers found for AWB generation');
              console.log('Courier response data:', couriersResponse.data);
            }
          } catch (awbError) {
            console.error('AWB generation failed with error:', awbError);
            console.error('AWB generation failed with error:', {
              message: awbError.message,
              status: awbError.response?.status,
              data: awbError.response?.data
            });
            console.warn('AWB generation failed, but order created successfully:', awbError.message);
          }
        }
        
        return orderResult;
      } else {
        throw new Error('Failed to create Shiprocket order');
      }
    } catch (error) {
     
      console.error('Shiprocket order creation error:', error.response?.data || error.message);
      throw new Error(`Shiprocket order creation failed: ${error.response?.data?.message || error.message}`);
    }
  }

  // Generate AWB (Air Waybill)
  async generateAWB(shipmentId, courierId) {
    try {
      const headers = await this.getHeaders();
      
      console.log('Attempting AWB generation with:', {
        shipment_id: shipmentId,
        courier_id: courierId,
        url: `${this.baseURL}/courier/assign/awb`
      });
      
      const response = await axios.post(
        `${this.baseURL}/courier/assign/awb`,
        {
          shipment_id: shipmentId,
          courier_id: courierId
        },
        { headers }
      );

      console.log('AWB generation API response:', {
        status: response.status,
        data: response.data
      });

      // Check for specific error responses
      if (response.data && response.data.status_code === 350) {
        const errorMessage = response.data.message || 'Wallet balance insufficient';
        console.error('Shiprocket wallet balance error:', errorMessage);
        throw new Error(`Shiprocket wallet error: ${errorMessage}`);
      }

      if (response.data && response.data.awb_assign_status === 0) {
        const assignError = response.data.response?.data?.awb_assign_error || 'AWB assignment failed';
        console.error('AWB assignment failed:', assignError);
        throw new Error(`AWB assignment failed: ${assignError}`);
      }

      if (response.data && response.data.awb_code) {
        return {
          success: true,
          awb_code: response.data.awb_code,
          courier_name: response.data.courier_name
        };
      } else {
        console.error('AWB generation failed - no AWB code in response:', response.data);
        throw new Error('Failed to generate AWB - no AWB code returned');
      }
    } catch (error) {
      console.error('AWB generation error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        shipmentId,
        courierId
      });
      throw new Error(`AWB generation failed: ${error.response?.data?.message || error.message}`);
    }
  }

  // Track shipment
  async trackShipment(awbCode) {
    try {
      const headers = await this.getHeaders();
      
      const response = await axios.get(
        `${this.baseURL}/courier/track/awb/${awbCode}`,
        { headers }
      );

      if (response.data && response.data.tracking_data) {
        return {
          success: true,
          tracking_data: response.data.tracking_data,
          shipment_status: response.data.tracking_data.shipment_status,
          current_status: response.data.tracking_data.current_status
        };
      } else {
        throw new Error('No tracking data found');
      }
    } catch (error) {
      console.error('Tracking error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  // Get shipping rates
  async getShippingRates(deliveryPincode, cod = 0, weight = 0.5) {
    try {
      const headers = await this.getHeaders();
      
      const response = await axios.get(
        `${this.baseURL}/courier/serviceability/?pickup_postcode=${this.pickupAddress.pin_code}&delivery_postcode=${deliveryPincode}&cod=${cod}&weight=${weight}`,
        { headers }
      );

      if (response.data && response.data.status === 200) {
        return {
          success: true,
          available_couriers: response.data.data.available_courier_companies,
          recommended_courier: response.data.data.recommended_courier_company_id,
          rates: response.data.data.available_courier_companies.map(courier => ({
            courier_name: courier.courier_name,
            rate: courier.rate,
            estimated_delivery_days: courier.estimated_delivery_days,
            cod: courier.cod
          }))
        };
      } else {
        return {
          success: false,
          message: 'No courier services available for this location'
        };
      }
    } catch (error) {
      console.error('Shipping rates error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  // Cancel shipment
  async cancelShipment(awbCodes) {
    try {
      const headers = await this.getHeaders();
      
      const response = await axios.post(
        `${this.baseURL}/orders/cancel`,
        {
          awbs: Array.isArray(awbCodes) ? awbCodes : [awbCodes]
        },
        { headers }
      );

      return {
        success: true,
        message: response.data?.message || 'Shipment cancelled successfully'
      };
    } catch (error) {
      console.error('Shipment cancellation error:', error.response?.data || error.message);
      throw new Error(`Shipment cancellation failed: ${error.response?.data?.message || error.message}`);
    }
  }

  // Get pickup locations
  async getPickupLocations() {
    try {
      const headers = await this.getHeaders();
      
      const response = await axios.get(
        `${this.baseURL}/settings/company/pickup`,
        { headers }
      );

      return {
        success: true,
        pickup_locations: response.data?.data || []
      };
    } catch (error) {
      console.error('Get pickup locations error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  // Create pickup location
  async createPickupLocation() {
    try {
      const headers = await this.getHeaders();
      
      const response = await axios.post(
        `${this.baseURL}/settings/company/addpickup`,
        {
          pickup_location: this.pickupAddress.company_name,
          name: this.pickupAddress.name,
          email: this.pickupAddress.email,
          phone: this.pickupAddress.phone,
          address: this.pickupAddress.address,
          address_2: this.pickupAddress.address_2,
          city: this.pickupAddress.city,
          state: this.pickupAddress.state,
          country: this.pickupAddress.country,
          pin_code: this.pickupAddress.pin_code
        },
        { headers }
      );

      return {
        success: true,
        pickup_id: response.data?.pickup_id,
        message: 'Pickup location created successfully'
      };
    } catch (error) {
      console.error('Create pickup location error:', error.response?.data || error.message);
      throw new Error(`Pickup location creation failed: ${error.response?.data?.message || error.message}`);
    }
  }

  // Request pickup for shipment
  async requestPickup(shipmentIds) {
    try {
      const headers = await this.getHeaders();
      
      const response = await axios.post(
        `${this.baseURL}/courier/generate/pickup`,
        {
          shipment_id: Array.isArray(shipmentIds) ? shipmentIds : [shipmentIds]
        },
        { headers }
      );

      if (response.data && response.data.pickup_status === 1) {
        return {
          success: true,
          pickup_token_number: response.data.pickup_token_number,
          status: response.data.pickup_status,
          message: 'Pickup requested successfully'
        };
      } else {
        throw new Error('Failed to request pickup');
      }
    } catch (error) {
      console.error('Pickup request error:', error.response?.data || error.message);
      throw new Error(`Pickup request failed: ${error.response?.data?.message || error.message}`);
    }
  }

  // Mark shipment as dispatched/shipped
  async dispatchShipment(shipmentId) {
    try {
      const headers = await this.getHeaders();
      
      // First request pickup
      const pickupResult = await this.requestPickup(shipmentId);
      
      if (pickupResult.success) {
        return {
          success: true,
          pickup_token_number: pickupResult.pickup_token_number,
          message: 'Shipment dispatched successfully'
        };
      } else {
        throw new Error('Failed to dispatch shipment');
      }
    } catch (error) {
      console.error('Dispatch shipment error:', error.response?.data || error.message);
      throw new Error(`Dispatch failed: ${error.response?.data?.message || error.message}`);
    }
  }

  // Get all orders from Shiprocket
  async getOrders(page = 1, perPage = 50) {
    try {
      const headers = await this.getHeaders();
      
      const response = await axios.get(
        `${this.baseURL}/orders?page=${page}&per_page=${perPage}`,
        { headers }
      );

      return {
        success: true,
        orders: response.data?.data || [],
        meta: response.data?.meta || {}
      };
    } catch (error) {
      console.error('Get orders error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  // Check wallet balance
  async getWalletBalance() {
    try {
      const headers = await this.getHeaders();
      
      const response = await axios.get(
        `${this.baseURL}/settings/company/wallet-balance`,
        { headers }
      );

      return {
        success: true,
        balance: response.data?.data?.available_balance || 0,
        currency: response.data?.data?.currency || 'INR'
      };
    } catch (error) {
      console.error('Wallet balance check error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  // Webhook signature verification
  verifyWebhookSignature(payload, signature, secret) {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  }
}

module.exports = new ShiprocketService();
