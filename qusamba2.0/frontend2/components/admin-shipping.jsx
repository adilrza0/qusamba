"use client"

import { useState, useEffect } from "react"
import { Package, Truck, CheckCircle, Calendar, Search, Filter, Download, Mail } from "lucide-react"
import { useShipping } from '../hooks/useShipping'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { ordersAPI } from "@/services/api"

// Shipping carriers
const CARRIERS = [
  { value: 'fedex', label: 'FedEx' },
  { value: 'ups', label: 'UPS' },
  { value: 'dhl', label: 'DHL' },
  { value: 'usps', label: 'USPS' },
  { value: 'aramex', label: 'Aramex' },
  { value: 'bluedart', label: 'Blue Dart' },
  { value: 'dtdc', label: 'DTDC' },
  { value: 'ecom', label: 'Ecom Express' }
]

export function AdminShipping() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrders, setSelectedOrders] = useState([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [stats, setStats] = useState(null)
  
  // Shipping form state
  const [shipmentData, setShipmentData] = useState({
    trackingNumber: '',
    carrier: '',
    estimatedDelivery: '',
    notes: ''
  })
  
  const [isShipmentDialogOpen, setIsShipmentDialogOpen] = useState(false)
  const [isBulkShipping, setIsBulkShipping] = useState(false)
  const [currentOrderId, setCurrentOrderId] = useState(null)
  
  const { toast } = useToast()
  const { createShipment, bulkCreateShipments, shipOrder, bulkShipOrders, loading: shippingLoading } = useShipping()

  useEffect(() => {
    fetchOrders()
    fetchStats()
  }, [statusFilter])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      let response;
      
      // Use different endpoints based on status filter
      if (statusFilter === 'pending-approval') {
        // Fetch orders pending approval (paid but not shipped)
        response = await ordersAPI.getOrdersPendingApproval();
        setOrders(response.orders || []);
      } else if (statusFilter === 'all') {
        response = await ordersAPI.getAllOrders();
        setOrders(response.orders || response.data?.orders || []);
      } else {
        response = await ordersAPI.getAllOrders({ status: statusFilter });
        setOrders(response.orders || response.data?.orders || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast({
        title: "Error",
        description: "Failed to fetch orders", 
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await ordersAPI.getShippingStats()
      setStats(response.data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleApproveOrder = async (orderId, notes = '') => {
    try {
      await ordersAPI.approveOrder(orderId, { notes });
      
      toast({
        title: "Success",
        description: "Order approved and shipment created successfully!"
      });
      
      // Refresh data
      fetchOrders();
      fetchStats();
    } catch (error) {
      console.error('Error approving order:', error);
      toast({
        title: "Error",
        description: "Failed to approve order",
        variant: "destructive"
      });
    }
  };

  const handleBulkApproveOrders = async (notes = '') => {
    try {
      await ordersAPI.bulkApproveOrders({
        orderIds: selectedOrders,
        notes
      });
      
      toast({
        title: "Success",
        description: selectedOrders.length + " orders approved successfully!"
      });
      
      setSelectedOrders([]);
      fetchOrders();
      fetchStats();
    } catch (error) {
      console.error('Error bulk approving orders:', error);
      toast({
        title: "Error",
        description: "Failed to approve orders",
        variant: "destructive"
      });
    }
  };

  const handleShipOrder = async (orderId, isIndividual = true) => {
    try {
      if (isIndividual) {
        // Mark single order as shipped (actual dispatch)
        const targetOrderId = orderId || currentOrderId;
        if (!targetOrderId) {
          throw new Error('Order ID is required');
        }
        
        const result = await shipOrder(targetOrderId, 'Order dispatched from warehouse');
        
        toast({
          title: "Success",
          description: `Order shipped successfully! AWB: ${result.order?.awb_code || 'N/A'}`
        })
      } else {
        // Bulk ship orders (actual dispatch)
        if (selectedOrders.length === 0) {
          throw new Error('No orders selected');
        }
        
        const result = await bulkShipOrders(selectedOrders, 'Bulk dispatch from warehouse');
        
        toast({
          title: "Success",
          description: `${result.results?.length || selectedOrders.length} orders shipped successfully!`
        })
        
        setSelectedOrders([])
      }
      
      // Close dialog and reset state
      setIsShipmentDialogOpen(false)
      setCurrentOrderId(null)
      
      // Refresh data
      fetchOrders()
      fetchStats()
    } catch (error) {
      console.error('Error shipping order:', error)
      toast({
        title: "Error",
        description: "Failed to ship order(s)",
        variant: "destructive"
      })
    }
  }

  const handleSelectOrder = (orderId) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    )
  }

  const handleSelectAll = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([])
    } else {
      setSelectedOrders(filteredOrders.map(order => order._id))
    }
  }

  const openBulkShippingDialog = () => {
    setIsBulkShipping(true)
    setIsShipmentDialogOpen(true)
  }

  const openIndividualShippingDialog = (orderId) => {
    setCurrentOrderId(orderId)
    setIsBulkShipping(false)
    setIsShipmentDialogOpen(true)
  }

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesSearch
  })

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today Shipped</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todayShipped}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Shipments</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingShipments}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.statusBreakdown.reduce((sum, stat) => sum + stat.count, 0)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.statusBreakdown.reduce((sum, stat) => sum + stat.totalValue, 0))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search orders..."
              className="w-full md:w-[300px] pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending-approval">Pending Approval (Paid Orders)</SelectItem>
              <SelectItem value="processing">Processing (Approved)</SelectItem>
              <SelectItem value="ready_to_ship">Ready to Ship</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="placed">Placed</SelectItem>
              <SelectItem value="all">All Orders</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          {selectedOrders.length > 0 && (
            <>
              {statusFilter === 'pending-approval' ? (
                <Button onClick={() => handleBulkApproveOrders()} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Approve Selected ({selectedOrders.length})
                </Button>
              ) : statusFilter === 'ready_to_ship' ? (
                <Button onClick={openBulkShippingDialog} className="flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  Ship Selected ({selectedOrders.length})
                </Button>
              ) : statusFilter === 'processing' ? (
                <Button onClick={() => handleBulkApproveOrders()} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Approve Selected ({selectedOrders.length})
                </Button>
              ) : null}
            </>
          )}
          
          <Button variant="outline" onClick={fetchOrders}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Shipping Management</CardTitle>
          <CardDescription>
            Manage order shipments and tracking information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Loading orders...
                  </TableCell>
                </TableRow>
              ) : filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No orders found
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow key={order._id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedOrders.includes(order._id)}
                        onCheckedChange={() => handleSelectOrder(order._id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {order.orderNumber || order._id}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{order.user?.name}</div>
                        <div className="text-sm text-muted-foreground">{order.user?.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(order.createdAt)}</TableCell>
                    <TableCell>{order.items?.length || 0}</TableCell>
                    <TableCell>{formatCurrency(order.totalAmount || 0)}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={order.status === 'shipped' ? 'default' : 'secondary'}
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {/* Show different buttons based on order status */}
                      {order.status === 'processing' && order.payment?.status === 'completed' && !order.shipping?.shiprocket_order_id ? (
                        <Button
                          size="sm"
                          onClick={() => handleApproveOrder(order._id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve Order
                        </Button>
                      ) : (order.status === 'confirmed' || order.status === 'placed') && order.payment?.status === 'completed' && !order.shipping?.shiprocket_order_id ? (
                        <Button
                          size="sm"
                          onClick={() => handleApproveOrder(order._id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve Order
                        </Button>
                      ) : order.status === 'ready_to_ship' ? (
                        <Button
                          size="sm"
                          onClick={() => handleShipOrder(order._id)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Truck className="h-4 w-4 mr-1" />
                          Ship Order
                        </Button>
                      ) : order.status === 'shipped' && order.shipping?.awb_code ? (
                        <div className="text-sm">
                          <div className="font-medium">AWB: {order.shipping.awb_code}</div>
                          <div className="text-muted-foreground">{order.shipping.courier_name}</div>
                        </div>
                      ) : order.status === 'delivered' ? (
                        <Badge variant="default" className="bg-green-100 text-green-800">Delivered</Badge>
                      ) : order.status === 'shipped' ? (
                        <Badge variant="default" className="bg-blue-100 text-blue-800">Shipped</Badge>
                      ) : order.status === 'processing' && order.payment?.status !== 'completed' ? (
                        <span className="text-yellow-600 text-sm">Payment Pending</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Shipping Dialog */}
      <Dialog open={isShipmentDialogOpen} onOpenChange={setIsShipmentDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {isBulkShipping 
                ? `Ship ${selectedOrders.length} Orders` 
                : 'Ship Order'
              }
            </DialogTitle>
            <DialogDescription>
              Enter shipping details and tracking information
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-blue-900 mb-2">Ship Orders</h4>
              <p className="text-sm text-blue-700">
                {isBulkShipping 
                  ? `This will mark ${selectedOrders.length} orders as shipped and notify customers. Orders must be in 'ready_to_ship' status.`
                  : 'This will mark the order as shipped and notify the customer. Order must be in \'ready_to_ship\' status.'
                }
              </p>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsShipmentDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={() => handleShipOrder(null, isBulkShipping)}
                disabled={shippingLoading}
              >
                <Truck className="h-4 w-4 mr-2" />
                {shippingLoading 
                  ? 'Creating Shipment...' 
                  : `Ship ${isBulkShipping ? 'Orders' : 'Order'}`
                }
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
