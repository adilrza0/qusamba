"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Heart, Minus, Plus, ShoppingBag } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Mock product data - in a real app, this would come from a database
const product = {
  id: 1,
  name: "Golden Elegance",
  description:
    "Our Golden Elegance bangle is a stunning piece crafted with 24K gold-plated brass. The intricate design features delicate patterns inspired by traditional art, making it a perfect accessory for both casual and formal occasions. Each bangle is handcrafted by skilled artisans, ensuring exceptional quality and attention to detail.",
  price: 129.99,
  images: [
    "/placeholder.svg?height=500&width=500",
    "/placeholder.svg?height=500&width=500",
    "/placeholder.svg?height=500&width=500",
  ],
  colors: ["Gold", "Rose Gold"],
  sizes: ["Small", "Medium", "Large"],
  category: "Premium",
  features: [
    "24K gold-plated brass",
    "Intricate hand-carved design",
    "Comfortable fit",
    "Tarnish-resistant finish",
    "Comes in a luxury gift box",
  ],
  care: "To maintain the beauty of your bangle, avoid contact with water, perfumes, and chemicals. Clean with a soft, dry cloth.",
  relatedProducts: [
    {
      id: 2,
      name: "Silver Serenity",
      price: 89.99,
      image: "/placeholder.svg?height=200&width=200",
    },
    {
      id: 4,
      name: "Crystal Charm",
      price: 159.99,
      image: "/placeholder.svg?height=200&width=200",
    },
    {
      id: 7,
      name: "Floral Fantasy",
      price: 99.99,
      image: "/placeholder.svg?height=200&width=200",
    },
  ],
}

export default function ProductPage() {
  const [selectedColor, setSelectedColor] = useState(product.colors[0])
  const [selectedSize, setSelectedSize] = useState(product.sizes[0])
  const [quantity, setQuantity] = useState(1)
  const [activeImage, setActiveImage] = useState(0)

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  const increaseQuantity = () => {
    setQuantity(quantity + 1)
  }

  return (
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
              <Button variant="ghost" size="icon" aria-label="Cart">
                <ShoppingBag className="h-5 w-5" />
                <span className="sr-only">Cart</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container px-4 py-8 md:px-6 md:py-12">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-4">
              <div className="overflow-hidden rounded-lg">
                <Image
                  src={product.images[activeImage] || "/placeholder.svg"}
                  alt={product.name}
                  width={500}
                  height={500}
                  className="w-full object-cover" />
              </div>
              <div className="flex gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    className={`overflow-hidden rounded-lg border ${
                      activeImage === index ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => setActiveImage(index)}>
                    <Image
                      src={image || "/placeholder.svg"}
                      alt={`${product.name} ${index + 1}`}
                      width={80}
                      height={80} />
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold">{product.name}</h1>
                <p className="text-2xl font-semibold mt-2">${product.price.toFixed(2)}</p>
              </div>
              <p className="text-muted-foreground">{product.description}</p>
              <div className="space-y-4">
                <div>
                  <label htmlFor="color" className="block text-sm font-medium mb-2">
                    Color
                  </label>
                  <Select value={selectedColor} onValueChange={setSelectedColor}>
                    <SelectTrigger id="color" className="w-full">
                      <SelectValue placeholder="Select color" />
                    </SelectTrigger>
                    <SelectContent>
                      {product.colors.map((color) => (
                        <SelectItem key={color} value={color}>
                          {color}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label htmlFor="size" className="block text-sm font-medium mb-2">
                    Size
                  </label>
                  <Select value={selectedSize} onValueChange={setSelectedSize}>
                    <SelectTrigger id="size" className="w-full">
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      {product.sizes.map((size) => (
                        <SelectItem key={size} value={size}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium mb-2">
                    Quantity
                  </label>
                  <div className="flex items-center">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={decreaseQuantity}
                      disabled={quantity <= 1}>
                      <Minus className="h-4 w-4" />
                      <span className="sr-only">Decrease quantity</span>
                    </Button>
                    <span className="w-12 text-center">{quantity}</span>
                    <Button variant="outline" size="icon" onClick={increaseQuantity}>
                      <Plus className="h-4 w-4" />
                      <span className="sr-only">Increase quantity</span>
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="flex-1" size="lg">
                  Add to Cart
                </Button>
                <Button variant="outline" size="lg">
                  <Heart className="mr-2 h-4 w-4" />
                  Add to Wishlist
                </Button>
              </div>
              <Separator />
              <Tabs defaultValue="details">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="features">Features</TabsTrigger>
                  <TabsTrigger value="care">Care</TabsTrigger>
                </TabsList>
                <TabsContent value="details" className="pt-4">
                  <p className="text-muted-foreground">{product.description}</p>
                </TabsContent>
                <TabsContent value="features" className="pt-4">
                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    {product.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </TabsContent>
                <TabsContent value="care" className="pt-4">
                  <p className="text-muted-foreground">{product.care}</p>
                </TabsContent>
              </Tabs>
            </div>
          </div>
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
            <div
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {product.relatedProducts.map((relatedProduct) => (
                <Card key={relatedProduct.id} className="overflow-hidden">
                  <Link href={`/products/${relatedProduct.id}`}>
                    <Image
                      src={relatedProduct.image || "/placeholder.svg"}
                      alt={relatedProduct.name}
                      width={200}
                      height={200}
                      className="w-full aspect-square object-cover transition-transform hover:scale-105" />
                  </Link>
                  <CardContent className="p-4">
                    <Link href={`/products/${relatedProduct.id}`}>
                      <h3 className="font-semibold">{relatedProduct.name}</h3>
                    </Link>
                    <p className="font-medium mt-1">${relatedProduct.price.toFixed(2)}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
      <footer className="border-t py-6 md:py-10">
        <div
          className="container flex flex-col items-center justify-center gap-4 px-4 md:px-6 text-center">
          <Image
            src="/logo.png"
            alt="Qusamba Logo"
            width={100}
            height={32}
            className="mb-2" />
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Qusamba. All rights reserved.</p>
        </div>
      </footer>
    </div>)
  );
}
