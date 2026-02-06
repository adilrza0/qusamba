"use client"

import { useState, useEffect } from "react"
import {
  BarChart3,
  DollarSign,
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  TrendingDown,
  Activity
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { adminAPI } from "@/services/api"
import { useToast } from "@/components/ui/use-toast"
import { OverviewChart } from "@/components/charts/overview-chart"

export function AdminDashboard() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    revenueGrowth: 0,
    ordersGrowth: 0,
    productsGrowth: 0,
    customersGrowth: 0
  })
  const [loading, setLoading] = useState(true)
  const [recentSales, setRecentSales] = useState([])
  const [salesData, setSalesData] = useState([])
  const { toast } = useToast()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await adminAPI.getDashboardStats()
      setStats(response.data)
      setRecentSales(response.data.recentSales || [])
      setSalesData(response.data.salesChart || [])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }


  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatGrowth = (growth) => {
    const isPositive = growth >= 0
    return {
      value: `${isPositive ? '+' : ''}${growth.toFixed(1)}%`,
      isPositive,
      icon: isPositive ? TrendingUp : TrendingDown
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                <div className="h-4 w-4 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-24 bg-muted animate-pulse rounded mb-2" />
                <div className="h-3 w-32 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              {(() => {
                const growth = formatGrowth(stats.revenueGrowth)
                const Icon = growth.icon
                return (
                  <>
                    <Icon className={`h-3 w-3 mr-1 ${growth.isPositive ? 'text-green-600' : 'text-red-600'}`} />
                    <span className={growth.isPositive ? 'text-green-600' : 'text-red-600'}>
                      {growth.value}
                    </span>
                    <span className="ml-1">from last month</span>
                  </>
                )
              })()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{stats.totalOrders.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              {(() => {
                const growth = formatGrowth(stats.ordersGrowth)
                const Icon = growth.icon
                return (
                  <>
                    <Icon className={`h-3 w-3 mr-1 ${growth.isPositive ? 'text-green-600' : 'text-red-600'}`} />
                    <span className={growth.isPositive ? 'text-green-600' : 'text-red-600'}>
                      {growth.value}
                    </span>
                    <span className="ml-1">from last month</span>
                  </>
                )
              })()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              {(() => {
                const growth = formatGrowth(stats.productsGrowth)
                const Icon = growth.icon
                return (
                  <>
                    <Icon className={`h-3 w-3 mr-1 ${growth.isPositive ? 'text-green-600' : 'text-red-600'}`} />
                    <span className={growth.isPositive ? 'text-green-600' : 'text-red-600'}>
                      {growth.value}
                    </span>
                    <span className="ml-1">new products</span>
                  </>
                )
              })()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{stats.totalCustomers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              {(() => {
                const growth = formatGrowth(stats.customersGrowth)
                const Icon = growth.icon
                return (
                  <>
                    <Icon className={`h-3 w-3 mr-1 ${growth.isPositive ? 'text-green-600' : 'text-red-600'}`} />
                    <span className={growth.isPositive ? 'text-green-600' : 'text-red-600'}>
                      {growth.value}
                    </span>
                    <span className="ml-1">from last month</span>
                  </>
                )
              })()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Recent Sales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Monthly revenue for the past 7 months</CardDescription>
          </CardHeader>
          <CardContent>
            {salesData.length > 0 ? (
              <OverviewChart data={salesData} />
            ) : (
              <div className="flex items-center justify-center h-[350px] text-muted-foreground">
                <Activity className="h-8 w-8 mr-2" />
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
            <CardDescription>
              You made {recentSales.length} sales this week.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {recentSales.map((sale) => (
                <div key={sale.id} className="flex items-center">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                    {sale.customer.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="ml-4 space-y-1 flex-1">
                    <p className="text-sm font-medium leading-none">{sale.customer}</p>
                    <p className="text-sm text-muted-foreground">{sale.email}</p>
                  </div>
                  <div className="ml-auto font-medium">
                    +{formatCurrency(sale.amount)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
