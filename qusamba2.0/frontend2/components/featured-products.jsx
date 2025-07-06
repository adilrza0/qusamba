"use client"

import Link from "next/link"
import Image from "next/image"
import { Heart } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { useCart } from "@/contexts/cart-context"

// Mock data for featured products
const featuredProducts = [
  {
    id: 1,
    name: "Golden Elegance",
    description: "24K gold-plated bangle with intricate design",
    price: 129.99,
    image: "/placeholder.svg?height=300&width=300",
    colors: ["Gold", "Rose Gold"],
    sizes: ["Small", "Medium", "Large"],
  },
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
    id: 3,
    name: "Bohemian Dream",
    description: "Colorful beaded bangle with wooden accents",
    price: 49.99,
    image: "/placeholder.svg?height=300&width=300",
    colors: ["Multicolor"],
    sizes: ["One Size"],
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
]

export function FeaturedProducts() {
  const { dispatch } = useCart()

  const addToCart = (product) => {
    dispatch({
      type: "ADD_ITEM",
      payload: {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        color: product.colors[0], // Default to first color
        size: product.sizes[0], // Default to first size
      },
    })
  }

  return (
    (<section className="w-full py-12 md:py-24">
      <div className="container px-4 md:px-6">
        <div
          className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Featured Collection</h2>
            <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed">
              Explore our most popular bangles, handcrafted with love and attention to detail.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          {featuredProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden flex-col justify-between">
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 z-10 rounded-full bg-white/80 backdrop-blur-sm"
                  aria-label="Add to wishlist">
                  <Heart className="h-5 w-5" />
                  <span className="sr-only">Add to wishlist</span>
                </Button>
                <Link href={`/products/${product.id}`}>
                  <Image
                    src={ "/traditional.webp"}
                    alt={product.name}
                    width={300}
                    height={300}
                    className="object-cover mt-[-8%] w-full aspect-square transition-transform hover:scale-105" />
                </Link>
              </div>
              <CardContent className="p-4">
                <Link href={`/products/${product.id}`}>
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                </Link>
                <p className="text-sm text-muted-foreground mt-1">{product.description}</p>
                <div className="mt-2 flex items-center justify-between">
                  <p className="font-medium">${product.price.toFixed(2)}</p>
                  <div className="flex gap-1">
                    {product.colors.map((color) => (
                      <span key={color} className="text-xs text-muted-foreground">
                        {color}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-4 pb-0 pt-0">
                <Button className="w-full" onClick={() => addToCart(product)}>
                  Add to Cart
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        <div className="flex justify-center mt-10">
          <Link href="/products">
            <Button variant="outline" size="lg">
              View All Products
            </Button>
          </Link>
        </div>
      </div>
    </section>)
  );
}
