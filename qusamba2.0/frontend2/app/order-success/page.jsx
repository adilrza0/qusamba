"use client";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { CheckCircle, Package, Truck, Mail, ArrowRight, Copy, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

// Component that uses useSearchParams - needs to be wrapped in Suspense
function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Extract order data from URL parameters
  useEffect(() => {
    const orderId = searchParams.get('orderId');
    const orderNumber = searchParams.get('orderNumber');
    const paymentId = searchParams.get('paymentId');
    const amount = searchParams.get('amount');
    const status = searchParams.get('status');

    if (orderId) {
      setOrderData({
        orderId,
        orderNumber: orderNumber || `QUS${Date.now().toString().slice(-6)}`,
        paymentId: paymentId || 'N/A',
        amount: amount || '0',
        status: status || 'confirmed',
        paymentDate: new Date().toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      });
    }
    setLoading(false);
  }, [searchParams]);

  const copyOrderNumber = () => {
    if (orderData?.orderNumber) {
      navigator.clipboard.writeText(orderData.orderNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading order details...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="flex flex-col min-h-screen">
        <header className="border-b">
          <div className="container flex h-16 items-center justify-between px-4 md:px-6">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.png" alt="Qusamba Logo" width={120} height={40} />
            </Link>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-lg font-semibold mb-2">Order Not Found</h2>
            <p className="text-muted-foreground mb-6">Unable to load order details.</p>
            <Link href="/">
              <Button>Return to Home</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Qusamba Logo" width={120} height={40} />
          </Link>
        </div>
      </header>

      <main className="flex-1 py-8">
        <div className="container px-4 md:px-6 max-w-4xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-green-600 mb-2">Payment Successful!</h1>
            <p className="text-lg text-muted-foreground">
              Thank you for your order. Your payment has been confirmed.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Order Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Order Details
                </CardTitle>
                <CardDescription>Your order information and payment details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Order Number:</span>
                  <div className="flex items-center gap-2">
                    <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                      {orderData.orderNumber}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyOrderNumber}
                      className="h-6 w-6 p-0"
                    >
                      {copied ? (
                        <Check className="w-3 h-3 text-green-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-medium">Payment ID:</span>
                  <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                    {orderData.paymentId}
                  </code>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-medium">Amount Paid:</span>
                  <span className="font-semibold text-lg">₹{parseFloat(orderData.amount).toFixed(2)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-medium">Payment Date:</span>
                  <span>{orderData.paymentDate}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-medium">Status:</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {orderData.status === 'confirmed' ? 'Order Confirmed' : orderData.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  What's Next?
                </CardTitle>
                <CardDescription>Here's what happens with your order</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-green-600">Payment Confirmed</p>
                    <p className="text-sm text-muted-foreground">Your payment has been successfully processed</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium">Order Processing</p>
                    <p className="text-sm text-muted-foreground">We're preparing your items for shipment</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-gray-300 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-muted-foreground">Shipping Soon</p>
                    <p className="text-sm text-muted-foreground">You'll receive tracking details via email</p>
                  </div>
                </div>

                <Separator />

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-900">Email Confirmation Sent</p>
                      <p className="text-sm text-blue-700">
                        Check your email for order details and tracking information.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link href={`/orders/${orderData.orderId}`}>
              <Button className="w-full sm:w-auto">
                Track Your Order
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            
            <Link href="/products">
              <Button variant="outline" className="w-full sm:w-auto">
                Continue Shopping
              </Button>
            </Link>
          </div>

          {/* Additional Information */}
          <Card className="mt-8">
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <p className="font-medium">Need Help?</p>
                <p className="text-sm text-muted-foreground">
                  Contact us at{" "}
                  <a href="mailto:support@qusamba.com" className="text-primary hover:underline">
                    support@qusamba.com
                  </a>{" "}
                  or call{" "}
                  <a href="tel:+919990320258" className="text-primary hover:underline">
                    +91 99903 20258
                  </a>
                </p>
                <p className="text-xs text-muted-foreground">
                  Keep your order number handy for faster support.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

// Loading component for Suspense fallback
function OrderSuccessLoading() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Qusamba Logo" width={120} height={40} />
          </Link>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading order details...</p>
        </div>
      </main>
    </div>
  );
}

// Main export with Suspense boundary
export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<OrderSuccessLoading />}>
      <OrderSuccessContent />
    </Suspense>
  );
}
