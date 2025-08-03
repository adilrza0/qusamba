import { useState, useCallback } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const useShipping = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiCall = useCallback(async (url, options = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('qusamba-token');
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }
      
      const config = {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...options.headers,
        },
      };

      const response = await axios({
        url: `${API_BASE_URL}${url}`,
        ...config,
      });

      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
      setError(errorMessage);
      
      // If unauthorized, clear token and redirect to login
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem('qusamba-token');
        console.error('Authorization failed. Please login again.');
      }
      
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get shipping rates for a pincode
  const getShippingRates = useCallback(async (pincode, weight = 0.5, cod = 0) => {
    if (!pincode) {
      throw new Error('Pincode is required');
    }

    return apiCall(`/shipping/rates?pincode=${pincode}&weight=${weight}&cod=${cod}`, {
      method: 'GET',
    });
  }, [apiCall]);

  // Create shipment for an order
  const createShipment = useCallback(async (orderId) => {
    if (!orderId) {
      throw new Error('Order ID is required');
    }

    return apiCall(`/shipping/create/${orderId}`, {
      method: 'POST',
    });
  }, [apiCall]);

  // Track shipment by order ID
  const trackShipment = useCallback(async (orderId) => {
    if (!orderId) {
      throw new Error('Order ID is required');
    }

    return apiCall(`/shipping/track/${orderId}`, {
      method: 'GET',
    });
  }, [apiCall]);

  // Cancel shipment
  const cancelShipment = useCallback(async (orderId, reason = '') => {
    if (!orderId) {
      throw new Error('Order ID is required');
    }

    return apiCall(`/shipping/cancel/${orderId}`, {
      method: 'POST',
      data: { reason },
    });
  }, [apiCall]);

  // Bulk create shipments (admin only)
  const bulkCreateShipments = useCallback(async (orderIds) => {
    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      throw new Error('Order IDs array is required');
    }

    return apiCall('/shipping/bulk-create', {
      method: 'POST',
      data: { orderIds },
    });
  }, [apiCall]);

  // Get pickup locations (admin only)
  const getPickupLocations = useCallback(async () => {
    return apiCall('/shipping/pickup-locations', {
      method: 'GET',
    });
  }, [apiCall]);

  // Create pickup location (admin only)
  const createPickupLocation = useCallback(async () => {
    return apiCall('/shipping/pickup-location', {
      method: 'POST',
    });
  }, [apiCall]);

  // Ship order (mark as shipped)
  const shipOrder = useCallback(async (orderId, notes = '') => {
    if (!orderId) {
      throw new Error('Order ID is required');
    }

    return apiCall(`/shipping/ship/${orderId}`, {
      method: 'POST',
      data: { notes },
    });
  }, [apiCall]);

  // Bulk ship orders (mark as shipped)
  const bulkShipOrders = useCallback(async (orderIds, notes = '') => {
    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      throw new Error('Order IDs array is required');
    }

    return apiCall('/shipping/bulk-ship', {
      method: 'POST',
      data: { orderIds, notes },
    });
  }, [apiCall]);

  return {
    loading,
    error,
    getShippingRates,
    createShipment,
    trackShipment,
    cancelShipment,
    bulkCreateShipments,
    shipOrder,
    bulkShipOrders,
    getPickupLocations,
    createPickupLocation,
  };
};
