"use client";
import { useState } from 'react';

// Helper function to format contact number for Razorpay
const formatContactNumber = (contact) => {
  if (!contact) return '';
  
  // Remove all non-numeric characters
  const cleanNumber = contact.replace(/\D/g, '');
  
  // If it starts with country code +91, remove it
  if (cleanNumber.startsWith('91') && cleanNumber.length === 12) {
    return cleanNumber.substring(2);
  }
  
  // Return first 10 digits if longer
  if (cleanNumber.length > 10) {
    return cleanNumber.substring(cleanNumber.length - 10);
  }
  
  return cleanNumber;
};

const useRazorpay = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load Razorpay script dynamically
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Create Razorpay order
  const createOrder = async (orderData, token) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/razorpay/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create order');
      }

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Process payment
  const processPayment = async (orderData, userDetails, token) => {
    try {
      setLoading(true);
      setError(null);

      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay script');
      }

      // Create order
      const orderResponse = await createOrder(orderData, token);

      console.log('Order Response:', orderResponse);
      console.log('User Details:', userDetails);
      
      return new Promise((resolve, reject) => {
        const options = {
          key: orderResponse.key, // Enter the Key ID generated from the Dashboard
          amount: orderResponse.razorpayOrder.amount, // Amount is in currency subunits
          currency: orderResponse.razorpayOrder.currency,
          name: 'Qusamba',
          description: 'Payment for your order',
          order_id: orderResponse.razorpayOrder.id, // This is the order_id created in the backend
          handler: async function (response) {
            try {
              // Verify payment
              const verificationResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/razorpay/verify-payment`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  orderId: orderResponse.orderId
                })
              });

              const verificationData = await verificationResponse.json();

              if (!verificationResponse.ok) {
                throw new Error(verificationData.message || 'Payment verification failed');
              }

              setLoading(false);
              resolve({
                success: true,
                order: verificationData.order,
                paymentId: response.razorpay_payment_id
              });

            } catch (error) {
              setError(error.message);
              setLoading(false);
              reject(error);
            }
          },
          prefill: {
            name: userDetails.name || '',
            email: userDetails.email || '',
            contact: formatContactNumber(userDetails.contact || userDetails.phone || '')
          },
          notes: {
            order_id: orderResponse.orderId
          },
          theme: {
            color: '#000000'
          },
          modal: {
            ondismiss: function() {
              setLoading(false);
              reject(new Error('Payment cancelled by user'));
            }
          }
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
      });

    } catch (err) {
      setLoading(false);
      setError(err.message);
      throw err;
    }
  };

  return {
    processPayment,
    loading,
    error,
    clearError: () => setError(null)
  };
};

export default useRazorpay;
