"use client";
import { useState, useEffect } from "react"
import { CalendarIcon, TrendingUp, TrendingDown, RefreshCw } from "lucide-react"
import { addDays, format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { adminAPI } from "@/services/api"
import { cn } from "@/lib/utils"

export function AdminSales() {
  const [date, setDate] = useState({
    from: addDays(new Date(), -30),
    to: new Date(),
  })
  const [loading, setLoading] = useState(true)
  const [salesData, setSalesData] = useState({
    totalRevenue: 0,
    averageOrderValue: 0,
    totalOrders: 0,
    conversionRate: 0,
    revenueGrowth: 0,
    topProducts: [],
    salesByCategory: [],
    customerInsights: []
  })
  const [selectedView, setSelectedView] = useState('all')
  const { toast } = useToast()

  useEffect(() => {
    fetchSalesData()
  }, [date, selectedView])

  const fetchSalesData = async () => {
    try {
      setLoading(true)
      
      const params = {
        from: date.from?.toISOString(),
        to: date.to?.toISOString(),
        view: selectedView
      }
      
      const response = await adminAPI.getSalesReport(params)
      setSalesData(response.data)
    } catch (error) {
      console.error('Error fetching sales data:', error)
      toast({
        title: "Error",
        description: "Failed to load sales data. Please try again.",
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

  return (
    (<div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Sales Analytics</h2>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-[260px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(date.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2} />
            </PopoverContent>
          </Popover>
          <Select value={selectedView} onValueChange={setSelectedView}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select view" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sales</SelectItem>
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="retail">Retail</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchSalesData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-8 w-24 bg-muted animate-pulse rounded mb-2" />
                    <div className="h-3 w-32 bg-muted animate-pulse rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(salesData.totalRevenue)}</div>
                  <p className="text-xs text-muted-foreground flex items-center">
                    {(() => {
                      const growth = formatGrowth(salesData.revenueGrowth)
                      const Icon = growth.icon
                      return (
                        <>
                          <Icon className={`h-3 w-3 mr-1 ${growth.isPositive ? 'text-green-600' : 'text-red-600'}`} />
                          <span className={growth.isPositive ? 'text-green-600' : 'text-red-600'}>
                            {growth.value}
                          </span>
                          <span className="ml-1">from last period</span>
                        </>
                      )
                    })()} 
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(salesData.averageOrderValue)}</div>
                  <p className="text-xs text-muted-foreground">Based on {salesData.totalOrders} orders</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{salesData.totalOrders.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">In selected period</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{salesData.conversionRate.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">Visitors to customers</p>
                </CardContent>
              </Card>
            </div>
          )}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Revenue Over Time</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <img
                  src="/placeholder.svg?height=350&width=600"
                  alt="Chart"
                  width={600}
                  height={350}
                  className="rounded-md object-cover" />
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Top Selling Products</CardTitle>
                <CardDescription>Your best performing products in selected period.</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-6">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center space-y-2">
                        <div className="w-10 h-10 bg-muted animate-pulse rounded-md mr-4"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                          <div className="h-3 w-16 bg-muted animate-pulse rounded" />
                        </div>
                        <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {salesData.topProducts.map((product, index) => (
                      <div key={index} className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-md mr-4 flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">{product.sales} sold</p>
                        </div>
                        <div className="font-medium">{formatCurrency(product.revenue)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Product Sales</CardTitle>
              <CardDescription>Detailed breakdown of sales by product.</CardDescription>
            </CardHeader>
            <CardContent>
              <img
                src="/placeholder.svg?height=400&width=800"
                alt="Product Sales Chart"
                width={800}
                height={400}
                className="rounded-md object-cover" />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Category Performance</CardTitle>
              <CardDescription>Sales breakdown by product category.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="p-8 text-center">
                  <RefreshCw className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                  <p className="mt-2 text-muted-foreground">Loading category data...</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Orders</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                      <TableHead className="text-right">Avg. Order</TableHead>
                      <TableHead className="text-right">Share</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salesData.salesByCategory.map((category, index) => {
                      const share = (category.revenue / salesData.totalRevenue * 100).toFixed(1)
                      const avgOrder = category.orders > 0 ? category.revenue / category.orders : 0
                      
                      return (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{category.category}</TableCell>
                          <TableCell className="text-right">{category.orders.toLocaleString()}</TableCell>
                          <TableCell className="text-right">{formatCurrency(category.revenue)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(avgOrder)}</TableCell>
                          <TableCell className="text-right">{share}%</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Insights</CardTitle>
              <CardDescription>Customer segmentation and purchasing patterns.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="p-8 text-center">
                  <RefreshCw className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                  <p className="mt-2 text-muted-foreground">Loading customer data...</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer Segment</TableHead>
                      <TableHead className="text-right">Count</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                      <TableHead className="text-right">Avg. Spend</TableHead>
                      <TableHead className="text-right">Contribution</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salesData.customerInsights.map((segment, index) => {
                      const avgSpend = segment.count > 0 ? segment.revenue / segment.count : 0
                      const contribution = (segment.revenue / salesData.totalRevenue * 100).toFixed(1)
                      
                      return (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{segment.segment}</TableCell>
                          <TableCell className="text-right">{segment.count.toLocaleString()}</TableCell>
                          <TableCell className="text-right">{formatCurrency(segment.revenue)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(avgSpend)}</TableCell>
                          <TableCell className="text-right">{contribution}%</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>)
  );
}
