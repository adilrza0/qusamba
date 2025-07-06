"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  BarChart3,
  Box,
  DollarSign,
  Home,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  ShoppingCart,
  Users,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminOrders } from "@/components/admin-orders"
import { AdminProducts } from "@/components/admin-products"
import { AdminSales } from "@/components/admin-sales"
import { AdminAuthGuard } from "@/components/admin-auth-guard"

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("dashboard")

  return (
    <AdminAuthGuard>
      <div className="grid min-h-screen w-full md:grid-cols-[240px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Image src="/logo.png" alt="Qusamba Logo" width={100} height={32} />
            </Link>
          </div>
          <div className="flex-1 overflow-auto py-2">
            <nav className="grid items-start px-2 text-sm font-medium">
              <Button
                variant={activeTab === "dashboard" ? "secondary" : "ghost"}
                className="flex items-center justify-start gap-2 px-3"
                onClick={() => setActiveTab("dashboard")}>
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Button>
              <Button
                variant={activeTab === "orders" ? "secondary" : "ghost"}
                className="flex items-center justify-start gap-2 px-3"
                onClick={() => setActiveTab("orders")}>
                <ShoppingCart className="h-4 w-4" />
                Orders
              </Button>
              <Button
                variant={activeTab === "products" ? "secondary" : "ghost"}
                className="flex items-center justify-start gap-2 px-3"
                onClick={() => setActiveTab("products")}>
                <Package className="h-4 w-4" />
                Products
              </Button>
              <Button
                variant={activeTab === "sales" ? "secondary" : "ghost"}
                className="flex items-center justify-start gap-2 px-3"
                onClick={() => setActiveTab("sales")}>
                <BarChart3 className="h-4 w-4" />
                Sales
              </Button>
              <Button
                variant={activeTab === "customers" ? "secondary" : "ghost"}
                className="flex items-center justify-start gap-2 px-3"
                onClick={() => setActiveTab("customers")}>
                <Users className="h-4 w-4" />
                Customers
              </Button>
              <Button
                variant={activeTab === "settings" ? "secondary" : "ghost"}
                className="flex items-center justify-start gap-2 px-3"
                onClick={() => setActiveTab("settings")}>
                <Settings className="h-4 w-4" />
                Settings
              </Button>
            </nav>
          </div>
          <div className="mt-auto p-4">
            <Link href="/">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Home className="h-4 w-4" />
                Back to Store
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header
          className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <div className="w-full flex-1">
            <h1 className="text-lg font-semibold">Admin Dashboard</h1>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Image
                  src="/placeholder-user.jpg"
                  alt="Avatar"
                  width={32}
                  height={32}
                  className="rounded-full" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="h-full space-y-6">
            <div className="flex items-center">
              <TabsList>
                <TabsTrigger value="dashboard" className="relative">
                  Dashboard
                </TabsTrigger>
                <TabsTrigger value="orders">Orders</TabsTrigger>
                <TabsTrigger value="products">Products</TabsTrigger>
                <TabsTrigger value="sales">Sales</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent
              value="dashboard"
              className="h-full flex-col border-none p-0 data-[state=active]:flex">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">$45,231.89</div>
                    <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Sales</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">+12,234</div>
                    <p className="text-xs text-muted-foreground">+19% from last month</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Products</CardTitle>
                    <Box className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">24</div>
                    <p className="text-xs text-muted-foreground">+4 new products</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">+573</div>
                    <p className="text-xs text-muted-foreground">+201 since last hour</p>
                  </CardContent>
                </Card>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4">
                <Card className="col-span-4">
                  <CardHeader>
                    <CardTitle>Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="pl-2">
                    <Image
                      src="/placeholder.svg?height=350&width=600"
                      alt="Chart"
                      width={600}
                      height={350}
                      className="rounded-md object-cover" />
                  </CardContent>
                </Card>
                <Card className="col-span-3">
                  <CardHeader>
                    <CardTitle>Recent Sales</CardTitle>
                    <CardDescription>You made 265 sales this month.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-8">
                      <div className="flex items-center">
                        <Image
                          src="/placeholder-user.jpg"
                          alt="Avatar"
                          width={32}
                          height={32}
                          className="rounded-full mr-4" />
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium">Olivia Martin</p>
                          <p className="text-sm text-muted-foreground">olivia.martin@email.com</p>
                        </div>
                        <div className="font-medium">+$1,999.00</div>
                      </div>
                      <div className="flex items-center">
                        <Image
                          src="/placeholder-user.jpg"
                          alt="Avatar"
                          width={32}
                          height={32}
                          className="rounded-full mr-4" />
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium">Jackson Lee</p>
                          <p className="text-sm text-muted-foreground">jackson.lee@email.com</p>
                        </div>
                        <div className="font-medium">+$39.00</div>
                      </div>
                      <div className="flex items-center">
                        <Image
                          src="/placeholder-user.jpg"
                          alt="Avatar"
                          width={32}
                          height={32}
                          className="rounded-full mr-4" />
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium">Isabella Nguyen</p>
                          <p className="text-sm text-muted-foreground">isabella.nguyen@email.com</p>
                        </div>
                        <div className="font-medium">+$299.00</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent
              value="orders"
              className="h-full flex-col border-none p-0 data-[state=active]:flex">
              <AdminOrders />
            </TabsContent>
            <TabsContent
              value="products"
              className="h-full flex-col border-none p-0 data-[state=active]:flex">
              <AdminProducts />
            </TabsContent>
            <TabsContent
              value="sales"
              className="h-full flex-col border-none p-0 data-[state=active]:flex">
              <AdminSales />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
    </AdminAuthGuard>
  );
}
