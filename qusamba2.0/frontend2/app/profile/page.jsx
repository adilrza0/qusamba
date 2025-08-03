"use client";
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ShoppingBag, Heart, User, Save, MapPin, Edit, Trash2, Plus, Camera, Upload, Settings, Bell, Shield } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"
import { useCart } from "@/contexts/cart-context"
import { UserMenu } from "@/components/user-menu"
import useAddresses from "@/hooks/useAddresses"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

export default function ProfilePage() {
  const { state: authState } = useAuth()
  const { state: cartState } = useCart()
  const { addresses, loading: addressLoading, addAddress, updateAddress, deleteAddress, setDefaultAddress } = useAddresses()
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    bio: "",
    avatar: "",
  })
  const [isEditing, setIsEditing] = useState(false)
  const [saveMessage, setSaveMessage] = useState("")
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  
  // Preferences state
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsNotifications: false,
    newsletter: true,
    currency: 'INR',
    language: 'en',
  })
  
  // Address form state
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState(null)
  const [addressFormData, setAddressFormData] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India",
    phone: "",
  })

  useEffect(() => {
    if (authState.user) {
      setFormData({
        firstName: authState.user.firstName,
        lastName: authState.user.lastName,
        email: authState.user.email,
        phone: authState.user.phone || "",
        dateOfBirth: authState.user.dateOfBirth || "",
        gender: authState.user.gender || "",
        bio: authState.user.bio || "",
        avatar: authState.user.avatar || "",
      })
      
      // Load user preferences if available
      if (authState.user.preferences) {
        setPreferences({
          emailNotifications: authState.user.preferences.notifications?.email ?? true,
          smsNotifications: authState.user.preferences.notifications?.sms ?? false,
          newsletter: authState.user.preferences.newsletter ?? true,
          currency: authState.user.preferences.currency || 'INR',
          language: authState.user.preferences.language || 'en',
        })
      }
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

  // Avatar handling functions
  const handleAvatarChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatarPreview(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadAvatar = async () => {
    if (!avatarFile) return
    
    // In a real app, this would upload to your server/cloud storage
    try {
      // Simulate upload
      const formDataUpload = new FormData()
      formDataUpload.append('avatar', avatarFile)
      
      // For now, just use the preview URL
      setFormData({ ...formData, avatar: avatarPreview })
      setSaveMessage('Avatar uploaded successfully!')
      setTimeout(() => setSaveMessage(""), 3000)
      setAvatarFile(null)
      setAvatarPreview(null)
    } catch (error) {
      setSaveMessage('Error uploading avatar: ' + error.message)
      setTimeout(() => setSaveMessage(""), 3000)
    }
  }

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase()
  }

  // Address management functions
  const handleAddressInputChange = (e) => {
    const { name, value } = e.target
    setAddressFormData({ ...addressFormData, [name]: value })
  }

  const handleAddressSubmit = async () => {
    if (!addressFormData.firstName || !addressFormData.lastName || !addressFormData.address || 
        !addressFormData.city || !addressFormData.state || !addressFormData.zipCode || !addressFormData.phone) {
      setSaveMessage('Please fill in all required fields')
      setTimeout(() => setSaveMessage(""), 3000)
      return
    }

    try {
      if (editingAddress) {
        await updateAddress(editingAddress._id, addressFormData)
        setSaveMessage('Address updated successfully!')
      } else {
        await addAddress(addressFormData)
        setSaveMessage('Address added successfully!')
      }
      
      // Reset form
      setAddressFormData({
        firstName: "",
        lastName: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        country: "India",
        phone: "",
      })
      setShowAddressForm(false)
      setEditingAddress(null)
      setTimeout(() => setSaveMessage(""), 3000)
    } catch (error) {
      setSaveMessage('Error saving address: ' + error.message)
      setTimeout(() => setSaveMessage(""), 3000)
    }
  }

  const handleEditAddress = (address) => {
    setAddressFormData({
      firstName: address.firstName,
      lastName: address.lastName,
      address: address.address,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country,
      phone: address.phone,
    })
    setEditingAddress(address)
    setShowAddressForm(true)
  }

  const handleDeleteAddress = async (addressId) => {
    if (confirm('Are you sure you want to delete this address?')) {
      try {
        await deleteAddress(addressId)
        setSaveMessage('Address deleted successfully!')
        setTimeout(() => setSaveMessage(""), 3000)
      } catch (error) {
        setSaveMessage('Error deleting address: ' + error.message)
        setTimeout(() => setSaveMessage(""), 3000)
      }
    }
  }

  const handleSetDefaultAddress = async (addressId) => {
    try {
      await setDefaultAddress(addressId)
      setSaveMessage('Default address updated!')
      setTimeout(() => setSaveMessage(""), 3000)
    } catch (error) {
      setSaveMessage('Error setting default address: ' + error.message)
      setTimeout(() => setSaveMessage(""), 3000)
    }
  }

  const formatAddress = (address) => {
    return `${address.address}, ${address.city}, ${address.state} ${address.zipCode}, ${address.country}`
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
            {/* Profile Header */}
            <div className="mb-8">
              <div className="flex items-center gap-6 p-6 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage 
                      src={avatarPreview || formData.avatar || ''} 
                      alt={`${formData.firstName} ${formData.lastName}`} 
                    />
                    <AvatarFallback className="text-2xl">
                      {getInitials(formData.firstName, formData.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 -right-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                      id="avatar-upload"
                    />
                    <label
                      htmlFor="avatar-upload"
                      className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full cursor-pointer hover:bg-primary/90 transition-colors"
                    >
                      <Camera className="h-4 w-4" />
                    </label>
                  </div>
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold">
                    {formData.firstName} {formData.lastName}
                  </h1>
                  <p className="text-muted-foreground mb-2">{formData.email}</p>
                  {formData.bio && (
                    <p className="text-sm text-muted-foreground">{formData.bio}</p>
                  )}
                  <div className="flex items-center gap-4 mt-3">
                    <Badge variant="secondary">
                      <User className="h-3 w-3 mr-1" />
                      Customer
                    </Badge>
                    {formData.phone && (
                      <Badge variant="outline">
                        {formData.phone}
                      </Badge>
                    )}
                  </div>
                </div>
                {avatarFile && (
                  <Button onClick={uploadAvatar} size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                )}
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
                <div className="space-y-6">
                  {saveMessage && (
                    <Alert>
                      <AlertDescription>{saveMessage}</AlertDescription>
                    </Alert>
                  )}
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Personal Information</CardTitle>
                      <CardDescription>Update your personal details and contact information.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
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
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <div className="space-y-2">
                          <Label htmlFor="dateOfBirth">Date of Birth</Label>
                          <Input
                            id="dateOfBirth"
                            name="dateOfBirth"
                            type="date"
                            value={formData.dateOfBirth}
                            onChange={handleInputChange}
                            disabled={!isEditing} />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="gender">Gender</Label>
                        <Select
                          value={formData.gender}
                          onValueChange={(value) => setFormData({ ...formData, gender: value })}
                          disabled={!isEditing}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                            <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          name="bio"
                          value={formData.bio}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          placeholder="Tell us a little about yourself..."
                          rows={3}
                        />
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
                          <Button onClick={() => setIsEditing(true)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Profile
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Account Security */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Account Security
                      </CardTitle>
                      <CardDescription>Manage your account security settings.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">Password</h4>
                          <p className="text-sm text-muted-foreground">Last updated 3 months ago</p>
                        </div>
                        <Button variant="outline" size="sm">
                          Change Password
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">Two-Factor Authentication</h4>
                          <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                        </div>
                        <Button variant="outline" size="sm">
                          Enable 2FA
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
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
                <div className="space-y-6">
                  {saveMessage && (
                    <Alert>
                      <AlertDescription>{saveMessage}</AlertDescription>
                    </Alert>
                  )}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle>Shipping Addresses</CardTitle>
                        <CardDescription>Manage your shipping addresses for faster checkout.</CardDescription>
                      </div>
                      <Button 
                        onClick={() => {
                          setShowAddressForm(true)
                          setEditingAddress(null)
                          setAddressFormData({
                            firstName: "",
                            lastName: "",
                            address: "",
                            city: "",
                            state: "",
                            zipCode: "",
                            country: "India",
                            phone: "",
                          })
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Address
                      </Button>
                    </CardHeader>
                    <CardContent>
                      {addressLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                      ) : addresses.length === 0 ? (
                        <div className="text-center py-8">
                          <MapPin className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                          <h3 className="text-lg font-semibold mb-2">No addresses yet</h3>
                          <p className="text-muted-foreground mb-4">Add your first shipping address to get started.</p>
                        </div>
                      ) : (
                        <div className="grid gap-4">
                          {addresses.map((address) => (
                            <Card key={address._id} className={`relative ${address.isDefault ? 'ring-2 ring-primary' : ''}`}>
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <h4 className="font-semibold">
                                        {address.firstName} {address.lastName}
                                      </h4>
                                      {address.isDefault && (
                                        <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
                                          Default
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-1">
                                      {formatAddress(address)}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      Phone: {address.phone}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {!address.isDefault && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleSetDefaultAddress(address._id)}
                                      >
                                        Set Default
                                      </Button>
                                    )}
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleEditAddress(address)}
                                    >
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleDeleteAddress(address._id)}
                                      className="text-destructive hover:text-destructive"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Address Form */}
                  {showAddressForm && (
                    <Card>
                      <CardHeader>
                        <CardTitle>{editingAddress ? 'Edit Address' : 'Add New Address'}</CardTitle>
                        <CardDescription>
                          {editingAddress ? 'Update your address details' : 'Enter your new address details'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="addressFirstName">First Name</Label>
                            <Input
                              id="addressFirstName"
                              name="firstName"
                              value={addressFormData.firstName}
                              onChange={handleAddressInputChange}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="addressLastName">Last Name</Label>
                            <Input
                              id="addressLastName"
                              name="lastName"
                              value={addressFormData.lastName}
                              onChange={handleAddressInputChange}
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="addressStreet">Address</Label>
                          <Input
                            id="addressStreet"
                            name="address"
                            value={addressFormData.address}
                            onChange={handleAddressInputChange}
                            placeholder="123 Main Street"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="addressCity">City</Label>
                            <Input
                              id="addressCity"
                              name="city"
                              value={addressFormData.city}
                              onChange={handleAddressInputChange}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="addressZipCode">ZIP Code</Label>
                            <Input
                              id="addressZipCode"
                              name="zipCode"
                              value={addressFormData.zipCode}
                              onChange={handleAddressInputChange}
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="addressState">State</Label>
                            <Input
                              id="addressState"
                              name="state"
                              value={addressFormData.state}
                              onChange={handleAddressInputChange}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="addressCountry">Country</Label>
                            <Select
                              value={addressFormData.country}
                              onValueChange={(value) => 
                                setAddressFormData({ ...addressFormData, country: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select country" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="India">India</SelectItem>
                                <SelectItem value="US">United States</SelectItem>
                                <SelectItem value="UK">United Kingdom</SelectItem>
                                <SelectItem value="Canada">Canada</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="addressPhone">Phone Number</Label>
                          <Input
                            id="addressPhone"
                            name="phone"
                            value={addressFormData.phone}
                            onChange={handleAddressInputChange}
                            required
                          />
                        </div>

                        <div className="flex gap-2">
                          <Button onClick={handleAddressSubmit}>
                            <Save className="h-4 w-4 mr-2" />
                            {editingAddress ? 'Update Address' : 'Save Address'}
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              setShowAddressForm(false)
                              setEditingAddress(null)
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="preferences">
                <div className="space-y-6">
                  {saveMessage && (
                    <Alert>
                      <AlertDescription>{saveMessage}</AlertDescription>
                    </Alert>
                  )}
                  
                  {/* Notification Preferences */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5" />
                        Notification Preferences
                      </CardTitle>
                      <CardDescription>Choose how you want to be notified about updates.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h4 className="font-medium">Email Notifications</h4>
                          <p className="text-sm text-muted-foreground">
                            Receive updates about your orders and account activity
                          </p>
                        </div>
                        <Switch
                          checked={preferences.emailNotifications}
                          onCheckedChange={(checked) =>
                            setPreferences({ ...preferences, emailNotifications: checked })
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h4 className="font-medium">SMS Notifications</h4>
                          <p className="text-sm text-muted-foreground">
                            Get text messages for order updates and promotions
                          </p>
                        </div>
                        <Switch
                          checked={preferences.smsNotifications}
                          onCheckedChange={(checked) =>
                            setPreferences({ ...preferences, smsNotifications: checked })
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h4 className="font-medium">Newsletter</h4>
                          <p className="text-sm text-muted-foreground">
                            Subscribe to our newsletter for exclusive offers and updates
                          </p>
                        </div>
                        <Switch
                          checked={preferences.newsletter}
                          onCheckedChange={(checked) =>
                            setPreferences({ ...preferences, newsletter: checked })
                          }
                        />
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Regional Preferences */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Regional Preferences
                      </CardTitle>
                      <CardDescription>Set your location and language preferences.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="currency">Currency</Label>
                          <Select
                            value={preferences.currency}
                            onValueChange={(value) =>
                              setPreferences({ ...preferences, currency: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="INR">₹ Indian Rupee (INR)</SelectItem>
                              <SelectItem value="USD">$ US Dollar (USD)</SelectItem>
                              <SelectItem value="EUR">€ Euro (EUR)</SelectItem>
                              <SelectItem value="GBP">£ British Pound (GBP)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="language">Language</Label>
                          <Select
                            value={preferences.language}
                            onValueChange={(value) =>
                              setPreferences({ ...preferences, language: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="en">English</SelectItem>
                              <SelectItem value="hi">हिंदी (Hindi)</SelectItem>
                              <SelectItem value="es">Español (Spanish)</SelectItem>
                              <SelectItem value="fr">Français (French)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <Button onClick={() => {
                        setSaveMessage('Preferences updated successfully!')
                        setTimeout(() => setSaveMessage(''), 3000)
                      }}>
                        <Save className="mr-2 h-4 w-4" />
                        Save Preferences
                      </Button>
                    </CardContent>
                  </Card>
                  
                  {/* Account Actions */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-destructive">Danger Zone</CardTitle>
                      <CardDescription>These actions cannot be undone. Please be careful.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg">
                        <div>
                          <h4 className="font-medium">Delete Account</h4>
                          <p className="text-sm text-muted-foreground">
                            Permanently delete your account and all associated data
                          </p>
                        </div>
                        <Button variant="destructive" size="sm">
                          Delete Account
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      
    </div>)
  );
}
