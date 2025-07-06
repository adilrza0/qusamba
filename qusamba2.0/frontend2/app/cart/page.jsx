"use client"

import Link from "next/link"
import Image from "next/image"
import { Minus, Plus, ShoppingBag, Trash2, Heart } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CartProvider, useCart } from "@/contexts/cart-context"

export default function CartPage() {
  const { state, dispatch } = useCart()

  const updateQuantity = (id, newQuantity) => {
    dispatch({
      type: "UPDATE_QUANTITY",
      payload: { id, quantity: newQuantity },
    })
  }

  const removeItem = (id) => {
    dispatch({
      type: "REMOVE_ITEM",
      payload: id,
    })
  }

  const shipping = state.total > 100 ? 0 : 10.0
  const total = state.total + shipping

  return (
    <CartProvider>
    (<div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Qusamba Logo" width={120} height={40} />
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link
              href="/"
              className="text-sm font-medium hover:underline underline-offset-4">
              Home
            </Link>
            <Link
              href="/products"
              className="text-sm font-medium hover:underline underline-offset-4">
              Shop
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium hover:underline underline-offset-4">
              About
            </Link>
            <Link
              href="/contact"
              className="text-sm font-medium hover:underline underline-offset-4">
              Contact
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/wishlist">
              <Button variant="ghost" size="icon" aria-label="Wishlist">
                <Heart className="h-5 w-5" />
                <span className="sr-only">Wishlist</span>
              </Button>
            </Link>
            <Link href="/cart">
              <Button variant="ghost" size="icon" aria-label="Cart" className="relative">
                <ShoppingBag className="h-5 w-5" />
                {state.itemCount > 0 && (
                  <span
                    className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {state.itemCount}
                  </span>
                )}
                <span className="sr-only">Cart</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container px-4 py-8 md:px-6 md:py-12">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-2/3">
              <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
              {state.items.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h2 className="mt-4 text-lg font-semibold">Your cart is empty</h2>
                  <p className="mt-2 text-muted-foreground">Looks like you haven't added any items to your cart yet.</p>
                  <Link href="/products">
                    <Button className="mt-6">Continue Shopping</Button>
                  </Link>
                </div>
              ) : (
                <div className="rounded-lg border shadow-sm">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {state.items.map((item) => (
                        <TableRow key={`${item.id}-${item.color}-${item.size}`}>
                          <TableCell>
                            <div className="flex items-center gap-4">
                              <Image
                                src={item.image || "/placeholder.svg"}
                                alt={item.name}
                                width={80}
                                height={80}
                                className="rounded-md" />
                              <div>
                                <p className="font-medium">{item.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {item.color}, {item.size}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>${item.price.toFixed(2)}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                                <Minus className="h-3 w-3" />
                                <span className="sr-only">Decrease quantity</span>
                              </Button>
                              <span className="w-12 text-center">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                                <Plus className="h-3 w-3" />
                                <span className="sr-only">Increase quantity</span>
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">${(item.price * item.quantity).toFixed(2)}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => removeItem(item.id)}>
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Remove item</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              <div className="mt-6">
                <Link href="/products">
                  <Button variant="outline">Continue Shopping</Button>
                </Link>
              </div>
            </div>
            {state.items.length > 0 && (
              <div className="md:w-1/3">
                <div className="rounded-lg border p-6 shadow-sm">
                  <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>${state.total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
                    </div>
                    {shipping === 0 && <p className="text-sm text-green-600">🎉 Free shipping on orders over $100!</p>}
                    <Separator />
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                    <div className="pt-4">
                      <label htmlFor="coupon" className="block text-sm font-medium mb-2">
                        Coupon Code
                      </label>
                      <div className="flex gap-2">
                        <Input id="coupon" placeholder="Enter coupon code" />
                        <Button variant="outline">Apply</Button>
                      </div>
                    </div>
                    <Link href="/checkout">
                      <Button className="w-full mt-6" size="lg">
                        Proceed to Checkout
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      
    </div>)
    </CartProvider>
  );
}
