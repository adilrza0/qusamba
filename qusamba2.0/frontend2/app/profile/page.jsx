"use client";
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ShoppingBag, Heart, User, Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"
import { useCart } from "@/contexts/cart-context"
import { UserMenu } from "@/components/user-menu"

export default function ProfilePage() {
  const { state: authState } = useAuth()
  const { state: cartState } = useCart()
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
  })
  const [isEditing, setIsEditing] = useState(false)
  const [saveMessage, setSaveMessage] = useState("")

  useEffect(() => {
    if (authState.user) {
      setFormData({
        firstName: authState.user.firstName,
        lastName: authState.user.lastName,
        email: authState.user.email,
        phone: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        country: "",
      })
    }
  }, [authState.user])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSave = () => {
    // In a real app, this would update the user profile via API
    console.log("Saving profile:", formData)
    setIsEditing(false)
    setSaveMessage("Profile updated successfully!")
    setTimeout(() => setSaveMessage(""), 3000)
  }

  if (!authState.isAuthenticated) {
    return (
      (<div className="flex flex-col min-h-screen">
        <header className="border-b">
          <div className="container flex h-16 items-center justify-between px-4 md:px-6">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.png" alt="Qusamba Logo" width={120} height={40} />
            </Link>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-lg font-semibold mb-2">Please sign in</h2>
            <p className="text-muted-foreground mb-6">You need to be signed in to view your profile.</p>
            <Link href="/login">
              <Button>Sign In</Button>
            </Link>
          </div>
        </main>
      </div>)
    );
  }

  return (
    (<div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <div className="container px-4 py-8 md:px-6 md:py-12">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold">My Profile</h1>
                <p className="text-muted-foreground">Manage your account settings and preferences</p>
              </div>
            </div>

            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList>
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="orders">Orders</TabsTrigger>
                <TabsTrigger value="addresses">Addresses</TabsTrigger>
                <TabsTrigger value="preferences">Preferences</TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Update your personal details and contact information.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {saveMessage && (
                      <Alert>
                        <AlertDescription>{saveMessage}</AlertDescription>
                      </Alert>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          disabled={!isEditing} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          disabled={!isEditing} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" name="email" value={formData.email} disabled />
                      <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="(555) 123-4567" />
                    </div>
                    <div className="flex gap-2">
                      {isEditing ? (
                        <>
                          <Button onClick={handleSave}>
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                          </Button>
                          <Button variant="outline" onClick={() => setIsEditing(false)}>
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="orders">
                <Card>
                  <CardHeader>
                    <CardTitle>Order History</CardTitle>
                    <CardDescription>View your past orders and their status.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
                      <p className="text-muted-foreground mb-4">You haven't placed any orders yet.</p>
                      <Link href="/products">
                        <Button>Start Shopping</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="addresses">
                <Card>
                  <CardHeader>
                    <CardTitle>Shipping Addresses</CardTitle>
                    <CardDescription>Manage your shipping addresses for faster checkout.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Input
                          id="address"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          placeholder="123 Main Street" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          placeholder="New York" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          placeholder="NY" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="zipCode">ZIP Code</Label>
                        <Input
                          id="zipCode"
                          name="zipCode"
                          value={formData.zipCode}
                          onChange={handleInputChange}
                          placeholder="10001" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Input
                          id="country"
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          placeholder="United States" />
                      </div>
                    </div>
                    <Button>Save Address</Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="preferences">
                <Card>
                  <CardHeader>
                    <CardTitle>Preferences</CardTitle>
                    <CardDescription>Customize your shopping experience.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Email Notifications</h4>
                          <p className="text-sm text-muted-foreground">
                            Receive updates about your orders and new products
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          Configure
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Newsletter</h4>
                          <p className="text-sm text-muted-foreground">Get the latest news and exclusive offers</p>
                        </div>
                        <Button variant="outline" size="sm">
                          Subscribe
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      
    </div>)
  );
}
