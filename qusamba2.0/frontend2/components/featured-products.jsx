"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Heart } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { useCart } from "@/contexts/cart-context"
import { useWishlist } from "@/contexts/wishlist-context"
import { useAuth } from "@/contexts/auth-context"
import { productsAPI } from "@/services/api"
import { toast } from "sonner"

export function FeaturedProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const { dispatch: cartDispatch } = useCart()
  const { dispatch: wishlistDispatch } = useWishlist()
  const { state: authState } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        setLoading(true)
        const response = await productsAPI.getAll({ isFeatured: true, limit: 4 })
        setProducts(response.products || [])
      } catch (error) {
        console.error("Error fetching featured products:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchFeatured()
  }, [])

  const addToCart = (product) => {
    if (!authState.isAuthenticated) {
      toast.error("Please login to add items to your cart")
      router.push('/login')
      return
    }
    cartDispatch({
      type: "ADD_ITEM",
      payload: {
        id: product._id,
        name: product.name,
        price: product.price,
        image: product.images?.[0]?.url || "/traditional.webp",
        color: product.variants?.[0]?.color || 'Default',
        size: product.variants?.[0]?.size || 'Default',
      },
    })
    toast.success(`${product.name} added to cart!`)
  }

  const addToWishlist = (product) => {
    if (!authState.isAuthenticated) {
      toast.error("Please login to add items to your wishlist")
      router.push('/login')
      return
    }
    wishlistDispatch({
      type: "ADD_ITEM",
      payload: {
        id: product._id,
        name: product.name,
        description: product.description,
        price: product.price,
        image: product.images?.[0]?.url || "/traditional.webp",
      },
    })
    toast.success(`${product.name} added to wishlist!`)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (products.length === 0) return null

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
          {products.map((product) => (
            <Card key={product._id} className="overflow-hidden flex-col justify-between">
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 z-10 rounded-full bg-white/80 backdrop-blur-sm"
                  aria-label="Add to wishlist"
                  onClick={() => addToWishlist(product)}>
                  <Heart className="h-5 w-5" />
                  <span className="sr-only">Add to wishlist</span>
                </Button>
                <Link href={`/products/${product._id}`}>
                  <Image
                    src={product.images?.[0]?.url || "/traditional.webp"}
                    alt={product.name}
                    width={300}
                    height={300}
                    className="object-cover mt-[-8%] w-full aspect-square transition-transform hover:scale-105" />
                </Link>
              </div>
              <CardContent className="p-4">
                <Link href={`/products/${product._id}`}>
                  <h3 className="font-semibold text-lg line-clamp-1">{product.name}</h3>
                </Link>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{product.description}</p>
                <div className="mt-2 flex items-center justify-between">
                  <p className="font-medium">Rs. {product.price.toFixed(2)}</p>
                  <div className="flex gap-1">
                    {product.productType && (
                      <span className="text-xs text-muted-foreground bg-accent px-2 py-0.5 rounded">
                        {product.productType}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0">
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
