"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useCart } from "@/contexts/cart-context"
import { useWishlist } from "@/contexts/wishlist-context"
import { toast } from "sonner"

export default function TestCartWishlistPage() {
  const { state: cartState, dispatch: cartDispatch } = useCart()
  const { state: wishlistState, dispatch: wishlistDispatch } = useWishlist()

  // Sample product for testing
  const sampleProduct = {
    id: "test-1",
    name: "Test Golden Bangle",
    price: 99.99,
    image: "/placeholder.svg",
    color: "Gold",
    size: "Medium",
    description: "A beautiful test product"
  }

  const addToCart = () => {
    cartDispatch({
      type: "ADD_ITEM",
      payload: sampleProduct
    })
    toast.success("Item added to cart!")
  }

  const addToWishlist = () => {
    wishlistDispatch({
      type: "ADD_ITEM",
      payload: {
        ...sampleProduct,
        colors: ["Gold", "Silver"],
        sizes: ["Small", "Medium", "Large"]
      }
    })
    toast.success("Item added to wishlist!")
  }

  const clearCart = () => {
    cartDispatch({ type: "CLEAR_CART" })
    toast.success("Cart cleared!")
  }

  const clearWishlist = () => {
    wishlistDispatch({ type: "CLEAR_WISHLIST" })
    toast.success("Wishlist cleared!")
  }

  const removeFromCart = (item) => {
    cartDispatch({
      type: "REMOVE_ITEM",
      payload: {
        id: item.id,
        color: item.color,
        size: item.size
      }
    })
    toast.success("Item removed from cart!")
  }

  const removeFromWishlist = (id) => {
    wishlistDispatch({
      type: "REMOVE_ITEM",
      payload: id
    })
    toast.success("Item removed from wishlist!")
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Cart & Wishlist Test Page</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Cart Section */}
        <Card>
          <CardHeader>
            <CardTitle>Cart ({cartState.itemCount} items)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button onClick={addToCart} className="w-full">
                Add Test Item to Cart
              </Button>
              <Button onClick={clearCart} variant="outline" className="w-full">
                Clear Cart
              </Button>
              
              <div className="mt-4">
                <p className="font-semibold">Total: ${cartState.total.toFixed(2)}</p>
                
                {cartState.items.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h4 className="font-medium">Items in Cart:</h4>
                    {cartState.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-2 border rounded">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-600">
                            {item.color}, {item.size} - Qty: {item.quantity}
                          </p>
                        </div>
                        <Button 
                          onClick={() => removeFromCart(item)} 
                          variant="destructive" 
                          size="sm"
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Wishlist Section */}
        <Card>
          <CardHeader>
            <CardTitle>Wishlist ({wishlistState.itemCount} items)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button onClick={addToWishlist} className="w-full">
                Add Test Item to Wishlist
              </Button>
              <Button onClick={clearWishlist} variant="outline" className="w-full">
                Clear Wishlist
              </Button>
              
              {wishlistState.items.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h4 className="font-medium">Items in Wishlist:</h4>
                  {wishlistState.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-2 border rounded">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-600">
                          ?{item.price.toFixed(2)}
                        </p>
                      </div>
                      <Button 
                        onClick={() => removeFromWishlist(item.id)} 
                        variant="destructive" 
                        size="sm"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Test Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p>1. Click "Add Test Item to Cart" to add items to your cart</p>
            <p>2. Click "Add Test Item to Wishlist" to add items to your wishlist</p>
            <p>3. Check the navbar to see if the counters update correctly</p>
            <p>4. Go to /cart and /wishlist pages to see if items are displayed</p>
            <p>5. Try removing items and clearing the lists</p>
            <p>6. Refresh the page to test localStorage persistence</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
