"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
  Truck,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminOrders } from "@/components/admin-orders";
import { AdminProducts } from "@/components/admin-products";
import { AdminSales } from "@/components/admin-sales";
import { AdminCustomers } from "@/components/admin-customers";
import { AdminDashboard } from "@/components/admin-dashboard";
import { AdminShipping } from "@/components/admin-shipping";
import { AdminAuthGuard } from "@/components/admin-auth-guard";
import { UserMenu } from "@/components/user-menu";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <AdminAuthGuard>
      <div className="grid min-h-screen w-full md:grid-cols-[240px_1fr]">
        <div className="hidden border-r bg-muted/40 md:block">
          <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex h-14 items-center border-b px-4">
              <Link href="/" className="flex items-center gap-2 font-semibold">
                {/* <Image src="/logo.png" alt="Qusamba Logo" width={100} height={32} /> */}
                <span className="ml-2 text-2xl great-vibes font-bold text-primary">
                  Qusamba
                </span>
              </Link>
            </div>
            <div className="flex-1 overflow-auto py-2">
              <nav className="grid items-start px-2 text-sm font-medium">
                <Button
                  variant={activeTab === "dashboard" ? "secondary" : "ghost"}
                  className="flex items-center justify-start gap-2 px-3"
                  onClick={() => setActiveTab("dashboard")}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Button>
                <Button
                  variant={activeTab === "orders" ? "secondary" : "ghost"}
                  className="flex items-center justify-start gap-2 px-3"
                  onClick={() => setActiveTab("orders")}
                >
                  <ShoppingCart className="h-4 w-4" />
                  Orders
                </Button>
                <Button
                  variant={activeTab === "products" ? "secondary" : "ghost"}
                  className="flex items-center justify-start gap-2 px-3"
                  onClick={() => setActiveTab("products")}
                >
                  <Package className="h-4 w-4" />
                  Products
                </Button>
                <Button
                  variant={activeTab === "sales" ? "secondary" : "ghost"}
                  className="flex items-center justify-start gap-2 px-3"
                  onClick={() => setActiveTab("sales")}
                >
                  <BarChart3 className="h-4 w-4" />
                  Sales
                </Button>
                <Button
                  variant={activeTab === "shipping" ? "secondary" : "ghost"}
                  className="flex items-center justify-start gap-2 px-3"
                  onClick={() => setActiveTab("shipping")}
                >
                  <Truck className="h-4 w-4" />
                  Shipping
                </Button>
                <Button
                  variant={activeTab === "customers" ? "secondary" : "ghost"}
                  className="flex items-center justify-start gap-2 px-3"
                  onClick={() => setActiveTab("customers")}
                >
                  <Users className="h-4 w-4" />
                  Customers
                </Button>
                <Button
                  variant={activeTab === "settings" ? "secondary" : "ghost"}
                  className="flex items-center justify-start gap-2 px-3"
                  onClick={() => setActiveTab("settings")}
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Button>
              </nav>
            </div>
            <div className="mt-auto p-4">
              <Link href="/">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                >
                  <Home className="h-4 w-4" />
                  Back to Store
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <div className="flex flex-col">
          <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
            <div className="w-full flex-1">
              <h1 className="text-lg font-semibold">Admin Dashboard</h1>
            </div>
            <div className="hidden sm:block">
                          <UserMenu />
            </div>
            {/* <DropdownMenu>
              <DropdownMenuTrigger asChild>
                
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Image
                    src="/placeholder-user.jpg"
                    alt="Avatar"
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
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
            </DropdownMenu> */}
          </header>
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="h-full space-y-6"
            >
              <div className="flex items-center">
                <TabsList>
                  <TabsTrigger value="dashboard" className="relative">
                    Dashboard
                  </TabsTrigger>
                  <TabsTrigger value="orders">Orders</TabsTrigger>
                  <TabsTrigger value="products">Products</TabsTrigger>
                  <TabsTrigger value="sales">Sales</TabsTrigger>
                  <TabsTrigger value="customers">Customers</TabsTrigger>
                  <TabsTrigger value="shipping">Shipping</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent
                value="dashboard"
                className="h-full flex-col border-none p-0 data-[state=active]:flex"
              >
                <AdminDashboard />
              </TabsContent>
              <TabsContent
                value="orders"
                className="h-full flex-col border-none p-0 data-[state=active]:flex"
              >
                <AdminOrders />
              </TabsContent>
              <TabsContent
                value="products"
                className="h-full flex-col border-none p-0 data-[state=active]:flex"
              >
                <AdminProducts />
              </TabsContent>
              <TabsContent
                value="sales"
                className="h-full flex-col border-none p-0 data-[state=active]:flex"
              >
                <AdminSales />
              </TabsContent>
              <TabsContent
                value="customers"
                className="h-full flex-col border-none p-0 data-[state=active]:flex"
              >
                <AdminCustomers />
              </TabsContent>
              <TabsContent
                value="shipping"
                className="h-full flex-col border-none p-0 data-[state=active]:flex"
              >
                <AdminShipping />
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </AdminAuthGuard>
  );
}
