"use client";
import { useState, useEffect } from 'react';
import { addressAPI } from '@/services/api';

const useAddresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all addresses
  const fetchAddresses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await addressAPI.getAll();
      if (response.success) {
        setAddresses(response.addresses);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching addresses:', err);
    } finally {
      setLoading(false);
    }
  };

  // Add a new address
  const addAddress = async (addressData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await addressAPI.add(addressData);
      if (response.success) {
        setAddresses(response.addresses);
        return { success: true };
      }
    } catch (err) {
      setError(err.message);
      console.error('Error adding address:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Update an existing address
  const updateAddress = async (addressId, addressData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await addressAPI.update(addressId, addressData);
      if (response.success) {
        setAddresses(response.addresses);
        return { success: true };
      }
    } catch (err) {
      setError(err.message);
      console.error('Error updating address:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Delete an address
  const deleteAddress = async (addressId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await addressAPI.delete(addressId);
      if (response.success) {
        setAddresses(response.addresses);
        return { success: true };
      }
    } catch (err) {
      setError(err.message);
      console.error('Error deleting address:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Set default address
  const setDefaultAddress = async (addressId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await addressAPI.setDefault(addressId);
      if (response.success) {
        setAddresses(response.addresses);
        return { success: true };
      }
    } catch (err) {
      setError(err.message);
      console.error('Error setting default address:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Get default address
  const getDefaultAddress = () => {
    return addresses.find(addr => addr.isDefault) || null;
  };

  // Load addresses on hook initialization only if user is authenticated
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('qusamba-token') : null;
    if (token) {
      fetchAddresses();
    }
  }, []);

  return {
    addresses,
    loading,
    error,
    fetchAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    getDefaultAddress,
    clearError: () => setError(null)
  };
};

export default useAddresses;
