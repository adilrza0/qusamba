"use client";
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ShoppingBag, CreditCard, Lock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import AddressSelector from "@/components/ui/address-selector"
import useRazorpay from "@/hooks/useRazorpay";
import useAddresses from "@/hooks/useAddresses";
import { useCart } from "@/contexts/cart-context"

export default function CheckoutPage() {
  const router = useRouter();
  const { state } = useCart()
  const { addAddress } = useAddresses();
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
  })
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const { processPayment, loading, error, clearError } = useRazorpay();

  useEffect(() => {
    // Only access localStorage on client side
    if (typeof window !== 'undefined') {
      setToken(localStorage.getItem("qusamba-token"));
      setIsLoading(false);
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate that an address is selected
    if (!selectedAddress) {
      alert("Please select a shipping address");
      return;
    }

    const orderData = {
      amount: total,
      currency: "INR",
      shippingAddress: selectedAddress,
      items: state.items,
      subtotal: state.total,
      shippingCost: shipping,
      tax: tax
    };

    const userDetails = {
      name: selectedAddress.firstName + " " + selectedAddress.lastName,
      email: formData.email,
      contact: selectedAddress.phone
    };

    try {
      const paymentResult = await processPayment(orderData, userDetails, token );
      console.log("Payment successful!", paymentResult);
      
      // Clear cart after successful payment
      // You might need to add this method to your cart context
      // state.clearCart();
      
      // Redirect to success page with order details
      const searchParams = new URLSearchParams({
        orderId: paymentResult.order._id,
        orderNumber: paymentResult.order.orderNumber,
        paymentId: paymentResult.paymentId,
        amount: paymentResult.order.totalAmount.toString(),
        status: paymentResult.order.status
      });
      
      router.push(`/order-success?${searchParams.toString()}`);
      
    } catch (err) {
      console.error("Payment failed", err);
      alert(`Payment failed: ${err.message}`);
    }
  }

  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
  };

  const handleNewAddress = async (newAddress) => {
    const result = await addAddress(newAddress);
    if (result.success) {
      setSelectedAddress(newAddress);
      setShowNewAddressForm(false);
    }
  };
  console.log(state.total)
  const shipping = state.total < 100 ? 0 : 10.0
  console.log(shipping)
  const tax = state.total * 0.08 // 8% tax
  const total = state.total + shipping + tax

  // Show loading screen while initializing
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading checkout...</p>
          </div>
        </main>
      </div>
    );
  }

  if (state.items.length === 0) {
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
            <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-lg font-semibold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">Add some items to your cart before checking out.</p>
            <Link href="/products">
              <Button>Continue Shopping</Button>
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
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Checkout Form */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold">Checkout</h1>
                <p className="text-muted-foreground">Complete your order below</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Payment Method Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Payment Method
                    </CardTitle>
                    <CardDescription>
                      Your payment will be processed securely via Razorpay
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3 p-3 rounded-lg border bg-accent/5">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-primary/10">
                          <CreditCard className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Razorpay Payment Gateway</p>
                          <p className="text-sm text-muted-foreground">
                            Supports UPI, Cards, NetBanking, and Wallets
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                {/* Address Selection */}
                <AddressSelector
                  selectedAddress={selectedAddress}
                  onAddressSelect={handleAddressSelect}
                  onNewAddress={handleNewAddress}
                  showNewAddressForm={showNewAddressForm}
                  setShowNewAddressForm={setShowNewAddressForm}
                  className="mb-6"
                />

                {/* Contact Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required />
                    </div>
                  </CardContent>
                </Card>


                <div className="flex items-center space-x-2">
                  <Checkbox id="terms" required />
                  <Label htmlFor="terms" className="text-sm">
                    I agree to the{" "}
                    <Link href="#" className="underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="#" className="underline">
                      Privacy Policy
                    </Link>
                  </Label>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? 'Processing...' : `Complete Order - ₹${total.toFixed(2)}`}
                </Button>
              </form>
            </div>

            {/* Order Summary */}
            <div className="lg:sticky lg:top-8">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {state.items.map((item) => (
                    <div
                      key={`${item.id}-${item.color}-${item.size}`}
                      className="flex items-center gap-4">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        width={60}
                        height={60}
                        className="rounded-md" />
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.color}, {item.size} × {item.quantity}
                        </p>
                      </div>
                      <p className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>₹{state.total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>{shipping === 0 ? "Free" : `₹${shipping.toFixed(2)}`}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax</span>
                      <span>₹{tax.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span>₹{total.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>)
  );
}
