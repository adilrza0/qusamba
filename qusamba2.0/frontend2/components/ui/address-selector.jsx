"use client";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin, Plus, Pencil, Trash2 } from "lucide-react";
import useAddresses from "@/hooks/useAddresses";

const AddressSelector = ({
  selectedAddress,
  onAddressSelect,
  onNewAddress,
  showNewAddressForm,
  setShowNewAddressForm,
  className = "",
}) => {
  const { addresses, loading, addAddress, deleteAddress, setDefaultAddress } = useAddresses();
  const [newAddressData, setNewAddressData] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India",
    phone: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAddressData({ ...newAddressData, [name]: value });
  };

  const handleSubmitNewAddress = async () => {
    // Validate required fields
    if (!newAddressData.firstName || !newAddressData.lastName || !newAddressData.address || 
        !newAddressData.city || !newAddressData.state || !newAddressData.zipCode || !newAddressData.phone) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSaving(true);
    try {
      const result = await addAddress(newAddressData);
      if (result && result.success) {
        // Reset form and select the new address
        const savedAddressData = { ...newAddressData };
        setNewAddressData({
          firstName: "",
          lastName: "",
          address: "",
          city: "",
          state: "",
          zipCode: "",
          country: "India",
          phone: "",
        });
        setShowNewAddressForm(false);
        // Notify parent component about the new address
        if (onNewAddress) {
          onNewAddress(savedAddressData);
        }
      } else {
        alert('Failed to save address. Please try again.');
      }
    } catch (error) {
      alert('Error saving address: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddressSelection = (addressId) => {
    const address = addresses.find((addr) => addr._id === addressId);
    if (address && onAddressSelect) {
      onAddressSelect(address);
    }
  };

  const formatAddress = (address) => {
    return `${address.address}, ${address.city}, ${address.state} ${address.zipCode}, ${address.country}`;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Shipping Address
        </CardTitle>
        <CardDescription>
          Choose a saved address or add a new one
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <div className="text-sm text-muted-foreground">
              Loading addresses...
            </div>
          </div>
        ) : (
          <>
            {addresses.length > 0 && (
              <div className="space-y-3">
                <Label>Saved Addresses</Label>
                <RadioGroup
                  value={selectedAddress?._id || ""}
                  onValueChange={handleAddressSelection}
                  className="space-y-3"
                >
                  {addresses.map((address) => (
                    <div
                      key={address._id}
                      className="flex items-start space-x-3"
                    >
                      <RadioGroupItem
                        value={address._id}
                        id={address._id}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <Label
                          htmlFor={address._id}
                          className="cursor-pointer block p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">
                              {address.firstName} {address.lastName}
                            </span>
                            {address.isDefault && (
                              <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {formatAddress(address)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Phone: {address.phone}
                          </p>
                        </Label>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            {!showNewAddressForm ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowNewAddressForm(true)}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Address
              </Button>
            ) : (
              <div className="space-y-4 p-4 border rounded-lg bg-accent/5">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Add New Address</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowNewAddressForm(false)}
                  >
                    Cancel
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={newAddressData.firstName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={newAddressData.lastName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      name="address"
                      value={newAddressData.address}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        name="city"
                        value={newAddressData.city}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="zipCode">ZIP Code</Label>
                      <Input
                        id="zipCode"
                        name="zipCode"
                        value={newAddressData.zipCode}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        name="state"
                        value={newAddressData.state}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Select
                        value={newAddressData.country}
                        onValueChange={(value) => 
                          setNewAddressData({ ...newAddressData, country: value })
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
                  
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={newAddressData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <Button 
                    type="button" 
                    onClick={handleSubmitNewAddress} 
                    className="w-full"
                    disabled={isSaving}
                  >
                    {isSaving ? 'Saving...' : 'Save Address'}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AddressSelector;
