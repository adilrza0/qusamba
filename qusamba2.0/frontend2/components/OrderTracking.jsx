import React, { useState, useEffect } from 'react';
import { useShipping } from '../hooks/useShipping';

const OrderTracking = ({ orderId, orderData = null }) => {
  const [trackingData, setTrackingData] = useState(null);
  const [refreshLoading, setRefreshLoading] = useState(false);
  const { trackShipment, loading, error } = useShipping();

  const fetchTrackingData = async () => {
    if (!orderId) return;
    
    try {
      setRefreshLoading(true);
      const response = await trackShipment(orderId);
      if (response.success) {
        setTrackingData(response.tracking);
      }
    } catch (err) {
      console.error('Failed to fetch tracking data:', err);
    } finally {
      setRefreshLoading(false);
    }
  };

  useEffect(() => {
    fetchTrackingData();
  }, [orderId]);

  const getStatusColor = (status) => {
    const colors = {
      'placed': 'bg-gray-500',
      'confirmed': 'bg-blue-500', 
      'processing': 'bg-yellow-500',
      'ready_to_ship': 'bg-purple-500',
      'shipped': 'bg-indigo-500',
      'out_for_delivery': 'bg-orange-500',
      'delivered': 'bg-green-500',
      'cancelled': 'bg-red-500',
      'returned': 'bg-purple-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const getStatusText = (status) => {
    const texts = {
      'placed': 'Order Placed',
      'confirmed': 'Order Confirmed',
      'processing': 'Processing',
      'ready_to_ship': 'Ready to Ship',
      'shipped': 'Shipped',
      'out_for_delivery': 'Out for Delivery',
      'delivered': 'Delivered',
      'cancelled': 'Cancelled',
      'returned': 'Returned'
    };
    return texts[status] || status;
  };

  if (loading && !trackingData) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && !trackingData) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Failed to load tracking information: {error}</p>
        <button 
          onClick={fetchTrackingData}
          className="mt-2 text-red-600 hover:text-red-800 underline"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!trackingData && orderData?.shipping?.awb_code) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">Shipment is being prepared. Tracking will be available soon.</p>
        <button 
          onClick={fetchTrackingData}
          disabled={refreshLoading}
          className="mt-2 text-yellow-600 hover:text-yellow-800 underline disabled:opacity-50"
        >
          {refreshLoading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
    );
  }

  if (!trackingData && !orderData?.shipping?.awb_code) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-gray-600">No tracking information available yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Order Tracking</h3>
        <button 
          onClick={fetchTrackingData}
          disabled={refreshLoading}
          className="text-blue-600 hover:text-blue-800 text-sm underline disabled:opacity-50"
        >
          {refreshLoading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Tracking Information */}
      {trackingData && (
        <div className="space-y-4">
          {/* Current Status */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(trackingData.shipment_status?.toLowerCase())}`}></div>
              <div>
                <p className="font-medium text-gray-900">{trackingData.current_status}</p>
                <p className="text-sm text-gray-600">Current Status</p>
              </div>
            </div>
          </div>

          {/* Shipment Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-700">AWB Code</p>
              <p className="text-lg font-mono text-gray-900">{trackingData.awb_code}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Courier</p>
              <p className="text-lg text-gray-900">{trackingData.courier_name}</p>
            </div>
          </div>

          {/* Tracking URL */}
          {trackingData.tracking_url && (
            <div>
              <a 
                href={trackingData.tracking_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
              >
                Track on Shiprocket
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          )}

          {/* Detailed Tracking History */}
          {trackingData.tracking_data && trackingData.tracking_data.track_detail && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Tracking History</h4>
              <div className="space-y-3">
                {trackingData.tracking_data.track_detail.map((event, index) => (
                  <div key={index} className="flex items-start space-x-3 pb-3 border-b border-gray-100 last:border-b-0">
                    <div className={`w-2 h-2 rounded-full mt-2 ${index === 0 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{event.message || event.status}</p>
                      <p className="text-xs text-gray-500">
                        {event.date && new Date(event.date).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                        {event.location && ` • ${event.location}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Order Tracking History (from your database) */}
      {orderData?.tracking && orderData.tracking.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3">Order Status History</h4>
          <div className="space-y-3">
            {orderData.tracking.reverse().map((event, index) => (
              <div key={index} className="flex items-start space-x-3 pb-3 border-b border-gray-100 last:border-b-0">
                <div className={`w-2 h-2 rounded-full mt-2 ${getStatusColor(event.status)}`}></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{event.message}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(event.timestamp).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTracking;
