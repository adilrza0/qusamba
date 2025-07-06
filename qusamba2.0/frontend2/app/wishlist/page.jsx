"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Heart, ShoppingBag, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

// Mock wishlist data
const initialWishlistItems = [
  {
    id: 2,
    name: "Silver Serenity",
    description: "Sterling silver bangle with pearl accents",
    price: 89.99,
    image: "/placeholder.svg?height=300&width=300",
    colors: ["Silver"],
    sizes: ["Small", "Medium", "Large"],
  },
  {
    id: 4,
    name: "Crystal Charm",
    description: "Elegant crystal-studded bangle for special occasions",
    price: 159.99,
    image: "/placeholder.svg?height=300&width=300",
    colors: ["Silver", "Gold"],
    sizes: ["Small", "Medium"],
  },
  {
    id: 7,
    name: "Floral Fantasy",
    description: "Bangle with delicate floral engravings",
    price: 99.99,
    image: "/placeholder.svg?height=300&width=300",
    colors: ["Silver", "Rose Gold"],
    sizes: ["Small", "Medium"],
  },
]

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState(initialWishlistItems)

  const removeFromWishlist = (id) => {
    setWishlistItems(wishlistItems.filter((item) => item.id !== id))
  }

  return (
    (<div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <div className="container px-4 py-8 md:px-6 md:py-12">
          <h1 className="text-3xl font-bold mb-6">Your Wishlist</h1>
          {wishlistItems.length === 0 ? (
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
              {wishlistItems.map((item) => (
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
                      <p className="font-medium">${item.price.toFixed(2)}</p>
                      <div className="flex gap-1">
                        {item.colors.map((color) => (
                          <span key={color} className="text-xs text-muted-foreground">
                            {color}
                          </span>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button className="w-full">Add to Cart</Button>
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
