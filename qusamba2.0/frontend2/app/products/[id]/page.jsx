"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Heart, Minus, Plus, ShoppingBag, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {  productsAPI as api } from "@/services/api"
import { useApi, useMutation } from "@/hooks/useApi"


export default function ProductPage() {
  const { id } = useParams()
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [activeImage, setActiveImage] = useState(0)
  
  // Fetch product data
  const { data: product, loading, error } = useApi(
    () => api.products.getById(id),
    [id]
  )
  
  // Fetch related products
  const { data: relatedProducts } = useApi(
    () => api.products.getAll({ limit: 4, category: product?.category?._id }),
    [product?.category?._id]
  )
  
  // Add to cart mutation
  const addToCartMutation = useMutation(
    ({ productId, variantId, quantity }) => api.cart.addItem(productId, variantId, quantity),
    {
      onSuccess: () => {
        toast.success("Product added to cart!")
      },
      onError: (error) => {
        toast.error(error.message || "Failed to add to cart")
      }
    }
  )
  
  // Add to wishlist mutation
  const addToWishlistMutation = useMutation(
    (productId) => api.wishlist.addItem(productId),
    {
      onSuccess: () => {
        toast.success("Product added to wishlist!")
      },
      onError: (error) => {
        toast.error(error.message || "Failed to add to wishlist")
      }
    }
  )
  
  // Set default variant when product loads
  useEffect(() => {
    if (product && product.variants && product.variants.length > 0) {
      setSelectedVariant(product.variants[0])
    }
  }, [product])
  
  // Update active image when variant changes
  useEffect(() => {
    if (selectedVariant && selectedVariant.images && selectedVariant.images.length > 0) {
      setActiveImage(0)
    }
  }, [selectedVariant])
  
  if (loading) {
    return <ProductSkeleton />
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <p className="text-muted-foreground mb-4">{error.message}</p>
        <Button asChild>
          <Link href="/products">Back to Products</Link>
        </Button>
      </div>
    )
  }
  
  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <Button asChild>
          <Link href="/products">Back to Products</Link>
        </Button>
      </div>
    )
  }
  
  const currentImages = selectedVariant?.images || product.images || []
  const currentPrice = selectedVariant?.price || product.price || 0
  const isInStock = selectedVariant?.stock > 0 || product.stock > 0
  
  const handleAddToCart = () => {
    if (!selectedVariant) {
      toast.error("Please select a variant")
      return
    }
    
    addToCartMutation.mutate({
      productId: product._id,
      variantId: selectedVariant._id,
      quantity
    })
  }
  
  const handleAddToWishlist = () => {
    addToWishlistMutation.mutate(product._id)
  }

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  const increaseQuantity = () => {
    const maxStock = selectedVariant?.stock || product.stock || 0
    if (quantity < maxStock) {
      setQuantity(quantity + 1)
    }
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
                  src={currentImages[activeImage] || "/placeholder.svg"}
                  alt={product.name}
                  width={500}
                  height={500}
                  className="w-full object-cover" />
              </div>
              <div className="flex gap-2">
                {currentImages.map((image, index) => (
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
                <div className="flex items-center gap-2 mt-2">
                  <p className="text-2xl font-semibold">${currentPrice.toFixed(2)}</p>
                  {product.category && (
                    <Badge variant="secondary">{product.category.name}</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={isInStock ? "default" : "destructive"}>
                    {isInStock ? "In Stock" : "Out of Stock"}
                  </Badge>
                  {product.averageRating && (
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500">★</span>
                      <span className="text-sm">{product.averageRating.toFixed(1)} ({product.reviewCount} reviews)</span>
                    </div>
                  )}
                </div>
              </div>
              <p className="text-muted-foreground">{product.description}</p>
              <div className="space-y-4">
                {product.variants && product.variants.length > 0 && (
                  <div>
                    <label htmlFor="variant" className="block text-sm font-medium mb-2">
                      Variant
                    </label>
                    <Select 
                      value={selectedVariant?._id || ""} 
                      onValueChange={(value) => {
                        const variant = product.variants.find(v => v._id === value)
                        setSelectedVariant(variant)
                      }}
                    >
                      <SelectTrigger id="variant" className="w-full">
                        <SelectValue placeholder="Select variant" />
                      </SelectTrigger>
                      <SelectContent>
                        {product.variants.map((variant) => (
                          <SelectItem key={variant._id} value={variant._id}>
                            {variant.name} - ${variant.price.toFixed(2)}
                            {variant.stock <= 5 && variant.stock > 0 && (
                              <span className="text-orange-500 ml-2">({variant.stock} left)</span>
                            )}
                            {variant.stock === 0 && (
                              <span className="text-red-500 ml-2">(Out of stock)</span>
                            )}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
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
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={increaseQuantity}
                      disabled={quantity >= (selectedVariant?.stock || product.stock || 0)}
                    >
                      <Plus className="h-4 w-4" />
                      <span className="sr-only">Increase quantity</span>
                    </Button>
                  </div>
                  {selectedVariant?.stock && selectedVariant.stock <= 10 && (
                    <p className="text-sm text-orange-500 mt-1">
                      Only {selectedVariant.stock} left in stock
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  className="flex-1" 
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={!isInStock || addToCartMutation.loading || !selectedVariant}
                >
                  {addToCartMutation.loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add to Cart"
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={handleAddToWishlist}
                  disabled={addToWishlistMutation.loading}
                >
                  {addToWishlistMutation.loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Heart className="mr-2 h-4 w-4" />
                  )}
                  Add to Wishlist
                </Button>
              </div>
              <Separator />
              <Tabs defaultValue="details">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="features">Features</TabsTrigger>
                  <TabsTrigger value="care">Care</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                </TabsList>
                <TabsContent value="details" className="pt-4">
                  <div className="space-y-4">
                    <p className="text-muted-foreground">{product.description}</p>
                    {product.specifications && Object.keys(product.specifications).length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Specifications</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          {Object.entries(product.specifications).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="text-muted-foreground capitalize">{key}:</span>
                              <span>{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="features" className="pt-4">
                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    {product.features?.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    )) || <li>No features listed</li>}
                  </ul>
                </TabsContent>
                <TabsContent value="care" className="pt-4">
                  <p className="text-muted-foreground">{product.careInstructions || "No care instructions available."}</p>
                </TabsContent>
                <TabsContent value="reviews" className="pt-4">
                  <div className="space-y-4">
                    {product.reviews && product.reviews.length > 0 ? (
                      product.reviews.map((review) => (
                        <div key={review._id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{review.user?.name || "Anonymous"}</span>
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <span key={i} className={`text-sm ${i < review.rating ? 'text-yellow-500' : 'text-gray-300'}`}>
                                    ★
                                  </span>
                                ))}
                              </div>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-muted-foreground">{review.comment}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground">No reviews yet. Be the first to review this product!</p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
            <div
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedProducts && relatedProducts.products ? (
                relatedProducts.products
                  .filter(p => p._id !== product._id)
                  .slice(0, 4)
                  .map((relatedProduct) => (
                    <Card key={relatedProduct._id} className="overflow-hidden">
                      <Link href={`/products/${relatedProduct._id}`}>
                        <Image
                          src={relatedProduct.images?.[0] || "/placeholder.svg"}
                          alt={relatedProduct.name}
                          width={200}
                          height={200}
                          className="w-full aspect-square object-cover transition-transform hover:scale-105" />
                      </Link>
                      <CardContent className="p-4">
                        <Link href={`/products/${relatedProduct._id}`}>
                          <h3 className="font-semibold">{relatedProduct.name}</h3>
                        </Link>
                        <p className="font-medium mt-1">${relatedProduct.price.toFixed(2)}</p>
                        {relatedProduct.averageRating && (
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-yellow-500 text-sm">★</span>
                            <span className="text-sm text-muted-foreground">{relatedProduct.averageRating.toFixed(1)}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
              ) : (
                // Loading skeleton for related products
                [...Array(4)].map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="w-full aspect-square" />
                    <CardContent className="p-4">
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardContent>
                  </Card>
                ))
              )}
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

// Loading skeleton component
function ProductSkeleton() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Qusamba Logo" width={120} height={40} />
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/wishlist">
              <Button variant="ghost" size="icon" aria-label="Wishlist">
                <Heart className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/cart">
              <Button variant="ghost" size="icon" aria-label="Cart">
                <ShoppingBag className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container px-4 py-8 md:px-6 md:py-12">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-4">
              <Skeleton className="w-full aspect-square rounded-lg" />
              <div className="flex gap-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="w-20 h-20 rounded-lg" />
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <Skeleton className="h-8 w-3/4 mb-2" />
                <Skeleton className="h-6 w-1/4" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="flex gap-4">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 w-40" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
