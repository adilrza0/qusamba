import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { adminAPI } from '@/services/api';
import { useToast } from '@/components/ui/use-toast';
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

export default function AdminDashboardStats() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    revenueGrowth: 0,
    ordersGrowth: 0,
    productsGrowth: 0,
    customersGrowth: 0,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getDashboardStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard stats. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatGrowth = (growth) => {
    const isPositive = growth >= 0;
    return {
      value: `${isPositive ? '+' : ''}${growth.toFixed(1)}%`,
      isPositive,
      icon: isPositive ? TrendingUp : TrendingDown,
    };
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
          <p className="text-xs text-muted-foreground flex items-center">
            {(() => {
              const growth = formatGrowth(stats.revenueGrowth);
              const Icon = growth.icon;
              return (
                <>
                  <Icon className={`h-3 w-3 mr-1 ${growth.isPositive ? 'text-green-600' : 'text-red-600'}`} />
                  <span className={growth.isPositive ? 'text-green-600' : 'text-red-600'}>
                    {growth.value}
                  </span>
                  <span className="ml-1">from last period</span>
                </>
              );
            })()}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Orders</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">+{stats.totalOrders.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground flex items-center">
            {(() => {
              const growth = formatGrowth(stats.ordersGrowth);
              const Icon = growth.icon;
              return (
                <>
                  <Icon className={`h-3 w-3 mr-1 ${growth.isPositive ? 'text-green-600' : 'text-red-600'}`} />
                  <span className={growth.isPositive ? 'text-green-600' : 'text-red-600'}>
                    {growth.value}
                  </span>
                  <span className="ml-1">from last period</span>
                </>
              );
            })()}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Products</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalProducts}</div>
          <p className="text-xs text-muted-foreground flex items-center">
            {(() => {
              const growth = formatGrowth(stats.productsGrowth);
              const Icon = growth.icon;
              return (
                <>
                  <Icon className={`h-3 w-3 mr-1 ${growth.isPositive ? 'text-green-600' : 'text-red-600'}`} />
                  <span className={growth.isPositive ? 'text-green-600' : 'text-red-600'}>
                    {growth.value}
                  </span>
                  <span className="ml-1">new products</span>
                </>
              );
            })()}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Customers</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">+{stats.totalCustomers.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground flex items-center">
            {(() => {
              const growth = formatGrowth(stats.customersGrowth);
              const Icon = growth.icon;
              return (
                <>
                  <Icon className={`h-3 w-3 mr-1 ${growth.isPositive ? 'text-green-600' : 'text-red-600'}`} />
                  <span className={growth.isPositive ? 'text-green-600' : 'text-red-600'}>
                    {growth.value}
                  </span>
                  <span className="ml-1">from last period</span>
                </>
              );
            })()}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

