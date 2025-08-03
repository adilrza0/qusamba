"use client"

import { useState, useEffect } from "react"
import { Eye, MoreHorizontal, Search, RefreshCw, Package, Truck, CheckCircle, XCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { ordersAPI } from "@/services/api"

// Order status options
const ORDER_STATUSES = [
  { value: 'placed', label: 'Placed', icon: Package, color: 'bg-yellow-100 text-yellow-800' },
  { value: 'confirmed', label: 'Confirmed', icon: CheckCircle, color: 'bg-blue-100 text-blue-800' },
  { value: 'processing', label: 'Processing', icon: RefreshCw, color: 'bg-indigo-100 text-indigo-800' },
  { value: 'shipped', label: 'Shipped', icon: Truck, color: 'bg-orange-100 text-orange-800' },
  { value: 'out_for_delivery', label: 'Out for Delivery', icon: Truck, color: 'bg-orange-200 text-orange-800' },
  { value: 'delivered', label: 'Delivered', icon: CheckCircle, color: 'bg-green-100 text-green-800' },
  { value: 'cancelled', label: 'Cancelled', icon: XCircle, color: 'bg-red-100 text-red-800' },
  { value: 'returned', label: 'Returned', icon: XCircle, color: 'bg-purple-100 text-purple-800' },
]


export function AdminOrders() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false)
  const [updatingOrderId, setUpdatingOrderId] = useState(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await ordersAPI.getAllOrders()
      console.log('Orders API response:', response) // Debug log
      // Handle different possible response structures
      const ordersList = response.orders || response.data?.orders || response.data || []
      setOrders(ordersList)
      console.log('Orders loaded:', ordersList.length) // Debug log
    } catch (error) {
      console.error('Error fetching orders:', error)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setUpdatingOrderId(orderId)
      
      await ordersAPI.updateOrderStatus(orderId, newStatus)
      
      // Update local state
      setOrders(orders.map(order => 
        order._id === orderId 
          ? { ...order, status: newStatus }
          : order
      ))
      
      toast({
        title: "Success",
        description: "Order status updated successfully."
      })
    } catch (error) {
      console.error('Error updating order status:', error)
      toast({
        title: "Error",
        description: "Failed to update order status. Please try again.",
        variant: "destructive"
      })
    } finally {
      setUpdatingOrderId(null)
    }
  }

  const viewOrderDetails = (order) => {
    setSelectedOrder(order)
    setIsOrderDetailsOpen(true)
  }

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || order.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusConfig = (status) => {
    return ORDER_STATUSES.find(s => s.value === status) || ORDER_STATUSES[0]
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Orders</h2>
        </div>
        <div className="rounded-md border">
          <div className="p-8 text-center">
            <RefreshCw className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">Loading orders...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Orders</h2>
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
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {ORDER_STATUSES.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={fetchOrders} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead className="hidden md:table-cell">Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden sm:table-cell">Items</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No orders found
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell className="font-medium">{order.orderNumber || order._id}</TableCell>
                  <TableCell>
                    <div>{order.user?.name || 'Unknown Customer'}</div>
                    <p className="text-sm text-muted-foreground hidden md:block">{order.user?.email}</p>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{formatDate(order.createdAt)}</TableCell>
                  <TableCell>
                    {(() => {
                      const statusConfig = getStatusConfig(order.status)
                      const Icon = statusConfig.icon
                      return (
                        <Badge className={statusConfig.color}>
                          <Icon className="w-3 h-3 mr-1" />
                          {statusConfig.label}
                        </Badge>
                      )
                    })()}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{order.items?.length || 0}</TableCell>
                  <TableCell className="text-right">{formatCurrency(order.totalAmount || 0)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" disabled={updatingOrderId === order._id}>
                          {updatingOrderId === order._id ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <MoreHorizontal className="h-4 w-4" />
                          )}
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => viewOrderDetails(order)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {ORDER_STATUSES.map((status) => (
                          <DropdownMenuItem 
                            key={status.value}
                            onClick={() => updateOrderStatus(order._id, status.value)}
                            disabled={updatingOrderId === order._id || order.status === status.value}
                          >
                            <status.icon className="mr-2 h-4 w-4" />
                            Mark as {status.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Order Details Dialog */}
      <Dialog open={isOrderDetailsOpen} onOpenChange={setIsOrderDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              {selectedOrder && `Order ${selectedOrder.orderNumber || selectedOrder._id}`}
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium">Customer Information</h4>
                  <p className="text-sm text-muted-foreground">{selectedOrder.user?.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.user?.email}</p>
                </div>
                <div>
                  <h4 className="font-medium">Order Information</h4>
                  <p className="text-sm text-muted-foreground">Date: {formatDate(selectedOrder.createdAt)}</p>
                  <p className="text-sm text-muted-foreground">Status: {getStatusConfig(selectedOrder.status).label}</p>
                  <p className="text-sm text-muted-foreground">Payment: {selectedOrder.payment?.status || 'N/A'}</p>
                  {selectedOrder.shipping?.trackingNumber && (
                    <p className="text-sm text-muted-foreground">Tracking: {selectedOrder.shipping.trackingNumber}</p>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Items</h4>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                      </div>
                      <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-2 border-t font-medium">
                  <span>Total</span>
                  <span>{formatCurrency(selectedOrder.totalAmount)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
