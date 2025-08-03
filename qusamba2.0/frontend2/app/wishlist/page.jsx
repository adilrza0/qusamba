"use client"

import Link from "next/link"
import Image from "next/image"
import { Heart, ShoppingBag, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { useWishlist } from "@/contexts/wishlist-context"
import { useCart } from "@/contexts/cart-context"

export default function WishlistPage() {
  const { state: wishlistState, dispatch: wishlistDispatch } = useWishlist()
  const { dispatch: cartDispatch } = useCart()

  const removeFromWishlist = (id) => {
    wishlistDispatch({ type: "REMOVE_ITEM", payload: id })
    toast.success("Item removed from wishlist")
  }

  const addToCart = (item) => {
    cartDispatch({
      type: "ADD_ITEM",
      payload: {
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        color: item.colors?.[0] || "Default",
        size: item.sizes?.[0] || "Default",
      },
    })
    toast.success("Item added to cart")
  }

  return (
    (<div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <div className="container px-4 py-8 md:px-6 md:py-12">
          <h1 className="text-3xl font-bold mb-6">Your Wishlist</h1>
          {wishlistState.items.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="mx-auto h-12 w-12 text-muted-foreground" />
              <h2 className="mt-4 text-lg font-semibold">Your wishlist is empty</h2>
              <p className="mt-2 text-muted-foreground">Looks like you haven't added any items to your wishlist yet.</p>
              <Link href="/products">
                <Button className="mt-6">Browse Products</Button>
              </Link>
            </div>
          ) : (
            <div
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {wishlistState.items.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 z-10 rounded-full bg-white/80 backdrop-blur-sm"
                      onClick={() => removeFromWishlist(item.id)}
                      aria-label="Remove from wishlist">
                      <Trash2 className="h-5 w-5" />
                      <span className="sr-only">Remove from wishlist</span>
                    </Button>
                    <Link href={`/products/${item.id}`}>
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        width={300}
                        height={300}
                        className="object-cover w-full aspect-square transition-transform hover:scale-105" />
                    </Link>
                  </div>
                  <CardContent className="p-4">
                    <Link href={`/products/${item.id}`}>
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                    </Link>
                    <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <p className="font-medium">?{item.price.toFixed(2)}</p>
                      <div className="flex gap-1">
                        {(item.colors || []).map((color) => (
                          <span key={color} className="text-xs text-muted-foreground">
                            {color}
                          </span>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button className="w-full" onClick={() => addToCart(item)}>Add to Cart</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
     
    </div>)
  );
}
