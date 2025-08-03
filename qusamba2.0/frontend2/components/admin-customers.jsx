"use client"

import { useState, useEffect } from "react"
import { Eye, MoreHorizontal, Search, RefreshCw, Mail, Phone, MapPin, User, Calendar } from "lucide-react"

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
import { adminAPI } from "@/services/api"

// Customer status options
const CUSTOMER_STATUSES = [
  { value: 'active', label: 'Active', color: 'bg-green-100 text-green-800' },
  { value: 'inactive', label: 'Inactive', color: 'bg-gray-100 text-gray-800' },
  { value: 'vip', label: 'VIP', color: 'bg-purple-100 text-purple-800' },
  { value: 'blocked', label: 'Blocked', color: 'bg-red-100 text-red-800' },
]


export function AdminCustomers() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [isCustomerDetailsOpen, setIsCustomerDetailsOpen] = useState(false)
  const [updatingCustomerId, setUpdatingCustomerId] = useState(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const response = await adminAPI.getUsers()
      console.log('Fetched customers:', response.data?.users || [])
      setCustomers(response.data?.users || [])
    } catch (error) {
      console.error('Error fetching customers:', error)
      setCustomers([])
    } finally {
      setLoading(false)
    }
  }

  const updateCustomerStatus = async (customerId, newStatus) => {
    try {
      setUpdatingCustomerId(customerId)
      
      await adminAPI.updateUser(customerId, { status: newStatus })
      
      // Update local state
      setCustomers(customers.map(customer => 
        customer._id === customerId 
          ? { ...customer, status: newStatus }
          : customer
      ))
      
      toast({
        title: "Success",
        description: "Customer status updated successfully."
      })
    } catch (error) {
      console.error('Error updating customer status:', error)
      toast({
        title: "Error",
        description: "Failed to update customer status. Please try again.",
        variant: "destructive"
      })
    } finally {
      setUpdatingCustomerId(null)
    }
  }

  const viewCustomerDetails = (customer) => {
    setSelectedCustomer(customer)
    setIsCustomerDetailsOpen(true)
  }

  const filteredCustomers = customers.filter((customer) => {
    // Only include users with the "customer" role
    if (!customer.role || customer.role !== "customer") return false

    const customerName = `${customer.firstName || ''} ${customer.lastName || ''}`.trim()
    const matchesSearch =
      customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer._id?.toLowerCase().includes(searchTerm.toLowerCase())

    const customerStatus = customer.isActive ? 'active' : 'inactive'
    const matchesStatus = statusFilter === "all" || customerStatus === statusFilter

    return matchesSearch && matchesStatus
  })
  console.log('Filtered customers:', filteredCustomers)

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusConfig = (status) => {
    return CUSTOMER_STATUSES.find(s => s.value === status) || CUSTOMER_STATUSES[0]
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Customers</h2>
        </div>
        <div className="rounded-md border">
          <div className="p-8 text-center">
            <RefreshCw className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">Loading customers...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Customers</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search customers..."
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
              {CUSTOMER_STATUSES.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={fetchCustomers} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Joined</TableHead>
              <TableHead className="hidden sm:table-cell">Orders</TableHead>
              <TableHead className="text-right">Total Spent</TableHead>
              <TableHead className="hidden lg:table-cell">Last Order</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No customers found
                </TableCell>
              </TableRow>
            ) : (
              filteredCustomers.map((customer) => (
                <TableRow key={customer._id}>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-medium mr-3">
                        {customer.name?.split(' ').map(n => n[0]).join('') || 'U'}
                      </div>
                      <div>
                        <div className="font-medium">{`${customer.firstName} ${customer.lastName}` || 'Unknown'}</div>
                        <p className="text-sm text-muted-foreground">{customer.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {(() => {
                      const statusConfig = getStatusConfig(customer.status)
                      return (
                        <Badge className={statusConfig.color}>
                          {statusConfig.label}
                        </Badge>
                      )
                    })()}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{formatDate(customer.createdAt)}</TableCell>
                  <TableCell className="hidden sm:table-cell">{customer.totalOrders || 0}</TableCell>
                  <TableCell className="text-right">{formatCurrency(customer.totalSpent || 0)}</TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {customer.lastOrderDate ? formatDate(customer.lastOrderDate) : 'Never'}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" disabled={updatingCustomerId === customer._id}>
                          {updatingCustomerId === customer._id ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <MoreHorizontal className="h-4 w-4" />
                          )}
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => viewCustomerDetails(customer)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {CUSTOMER_STATUSES.map((status) => (
                          <DropdownMenuItem 
                            key={status.value}
                            onClick={() => updateCustomerStatus(customer._id, status.value)}
                            disabled={updatingCustomerId === customer._id || customer.status === status.value}
                          >
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

      {/* Customer Details Dialog */}
      <Dialog open={isCustomerDetailsOpen} onOpenChange={setIsCustomerDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
            <DialogDescription>
              {selectedCustomer && selectedCustomer.name}
            </DialogDescription>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium flex items-center mb-2">
                      <User className="h-4 w-4 mr-2" />
                      Personal Information
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Name:</strong> {selectedCustomer.name}</p>
                      <p><strong>Email:</strong> {selectedCustomer.email}</p>
                      <p><strong>Phone:</strong> {selectedCustomer.phone || 'Not provided'}</p>
                      <p><strong>Status:</strong> {getStatusConfig(selectedCustomer.status).label}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium flex items-center mb-2">
                      <MapPin className="h-4 w-4 mr-2" />
                      Address
                    </h4>
                    <div className="text-sm text-muted-foreground">
                      {selectedCustomer.address ? (
                        <>
                          <p>{selectedCustomer.address.street}</p>
                          <p>{selectedCustomer.address.city}, {selectedCustomer.address.state} {selectedCustomer.address.zipCode}</p>
                          <p>{selectedCustomer.address.country}</p>
                        </>
                      ) : (
                        <p>No address provided</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium flex items-center mb-2">
                      <Calendar className="h-4 w-4 mr-2" />
                      Account History
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Member since:</strong> {formatDate(selectedCustomer.createdAt)}</p>
                      <p><strong>Total orders:</strong> {selectedCustomer.totalOrders || 0}</p>
                      <p><strong>Total spent:</strong> {formatCurrency(selectedCustomer.totalSpent || 0)}</p>
                      <p><strong>Last order:</strong> {selectedCustomer.lastOrderDate ? formatDate(selectedCustomer.lastOrderDate) : 'Never'}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Customer Metrics</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Average order:</strong> {
                        selectedCustomer.totalOrders > 0 
                          ? formatCurrency((selectedCustomer.totalSpent || 0) / selectedCustomer.totalOrders)
                          : '$0.00'
                      }</p>
                      <p><strong>Customer lifetime:</strong> {
                        Math.floor((new Date() - new Date(selectedCustomer.createdAt)) / (1000 * 60 * 60 * 24))
                      } days</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
