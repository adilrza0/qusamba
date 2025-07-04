"use client";
import { CalendarIcon } from "lucide-react"
import { addDays, format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { useState } from "react"

export function AdminSales() {
  const [date, setDate] = useState({
    from: new Date(2023, 0, 20),
    to: addDays(new Date(2023, 0, 20), 20),
  })

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
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select view" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sales</SelectItem>
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="retail">Retail</SelectItem>
            </SelectContent>
          </Select>
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$45,231.89</div>
                <p className="text-xs text-muted-foreground">+20.1% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$89.34</div>
                <p className="text-xs text-muted-foreground">+2.5% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">512</div>
                <p className="text-xs text-muted-foreground">+12.3% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3.2%</div>
                <p className="text-xs text-muted-foreground">+0.5% from last month</p>
              </CardContent>
            </Card>
          </div>
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
                <CardDescription>Your best performing products this month.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-muted rounded-md mr-4"></div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">Golden Elegance</p>
                      <p className="text-sm text-muted-foreground">129 sold</p>
                    </div>
                    <div className="font-medium">$16,768.71</div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-muted rounded-md mr-4"></div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">Silver Serenity</p>
                      <p className="text-sm text-muted-foreground">85 sold</p>
                    </div>
                    <div className="font-medium">$7,649.15</div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-muted rounded-md mr-4"></div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">Crystal Charm</p>
                      <p className="text-sm text-muted-foreground">42 sold</p>
                    </div>
                    <div className="font-medium">$6,719.58</div>
                  </div>
                </div>
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
              <img
                src="/placeholder.svg?height=400&width=800"
                alt="Category Performance Chart"
                width={800}
                height={400}
                className="rounded-md object-cover" />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Insights</CardTitle>
              <CardDescription>Customer demographics and purchasing patterns.</CardDescription>
            </CardHeader>
            <CardContent>
              <img
                src="/placeholder.svg?height=400&width=800"
                alt="Customer Insights Chart"
                width={800}
                height={400}
                className="rounded-md object-cover" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>)
  );
}
