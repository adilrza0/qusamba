"use client"

import { useState } from "react"
import { Eye, MoreHorizontal, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Mock orders data
const orders = [
  {
    id: "ORD-001",
    customer: "Sarah Johnson",
    email: "sarah@example.com",
    date: "2023-05-18",
    status: "Completed",
    total: 129.99,
    items: 1,
  },
  {
    id: "ORD-002",
    customer: "Michael Brown",
    email: "michael@example.com",
    date: "2023-05-17",
    status: "Processing",
    total: 99.98,
    items: 2,
  },
  {
    id: "ORD-003",
    customer: "Emily Davis",
    email: "emily@example.com",
    date: "2023-05-16",
    status: "Shipped",
    total: 159.99,
    items: 1,
  },
  {
    id: "ORD-004",
    customer: "David Wilson",
    email: "david@example.com",
    date: "2023-05-15",
    status: "Completed",
    total: 219.97,
    items: 3,
  },
  {
    id: "ORD-005",
    customer: "Jessica Martinez",
    email: "jessica@example.com",
    date: "2023-05-14",
    status: "Cancelled",
    total: 49.99,
    items: 1,
  },
  {
    id: "ORD-006",
    customer: "Robert Taylor",
    email: "robert@example.com",
    date: "2023-05-13",
    status: "Completed",
    total: 89.99,
    items: 1,
  },
  {
    id: "ORD-007",
    customer: "Jennifer Anderson",
    email: "jennifer@example.com",
    date: "2023-05-12",
    status: "Processing",
    total: 149.98,
    items: 2,
  },
  {
    id: "ORD-008",
    customer: "Christopher Thomas",
    email: "christopher@example.com",
    date: "2023-05-11",
    status: "Shipped",
    total: 79.99,
    items: 1,
  },
]

export function AdminOrders() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || order.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    (<div className="space-y-4">
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
              onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Processing">Processing</SelectItem>
              <SelectItem value="Shipped">Shipped</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
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
            {filteredOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>
                  <div>
                    <p>{order.customer}</p>
                    <p className="text-sm text-muted-foreground hidden md:block">{order.email}</p>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">{order.date}</TableCell>
                <TableCell>
                  <div
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      order.status === "Completed"
                        ? "bg-green-100 text-green-800"
                        : order.status === "Processing"
                          ? "bg-blue-100 text-blue-800"
                          : order.status === "Shipped"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                    }`}>
                    {order.status}
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">{order.items}</TableCell>
                <TableCell className="text-right">${order.total.toFixed(2)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        View details
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Update status</DropdownMenuItem>
                      <DropdownMenuItem>Email customer</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>)
  );
}
