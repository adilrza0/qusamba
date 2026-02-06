"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
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
import { productsAPI, cartAPI, wishlistAPI } from "@/services/api"
import { useApiEffect, useMutation } from "@/hooks/useApi"
import { useAuth } from "@/contexts/auth-context"
import { useCart } from "@/contexts/cart-context"


export default function ProductPage() {
  const { id } = useParams()
  const router = useRouter()
  const { state: authState } = useAuth()
  const { syncWithBackend } = useCart()
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [selectedSize, setSelectedSize] = useState(null)
  const [selectedColor, setSelectedColor] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [activeImage, setActiveImage] = useState(0)

  // Fetch product data
  const { data: product, loading, error } = useApiEffect(
    () => productsAPI.getById(id),
    [id]
  )
  console.log("Product data:", product, "Loading:", loading, "Error:", error)
  // Fetch related products
  const { data: relatedProducts } = useApiEffect(
    () => productsAPI.getAll({ limit: 4, category: product?.category?._id }),
    [product?.category?._id]
  )

  // Add to cart mutation
  const addToCartMutation = useMutation(
    ({ productId, quantity, color, size }) => cartAPI.add(productId, quantity, color, size)
  )

  // Add to wishlist mutation
  const addToWishlistMutation = useMutation(
    (productId) => wishlistAPI.add(productId)
  )

  // Set default variant when product loads
  useEffect(() => {
    // We intentionally don't set default size/color to force user selection
    // but if there's only one variant, we can default it.
    if (product && product.variants && product.variants.length === 1) {
      setSelectedVariant(product.variants[0])
      setSelectedSize(product.variants[0].size)
      setSelectedColor(product.variants[0].color)
    }
  }, [product])

  // Update selected variant when size or color changes
  useEffect(() => {
    if (product && product.variants && selectedSize && selectedColor) {
      const variant = product.variants.find(v => v.size === selectedSize && v.color === selectedColor)
      if (variant) {
        setSelectedVariant(variant)
      }
    }
  }, [selectedSize, selectedColor, product])

  // Get unique sizes and colors
  const availableSizes = product?.variants ? [...new Set(product.variants.map(v => v.size))] : []
  const availableColors = product?.variants ? [...new Set(product.variants.map(v => v.color))] : []

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

  // Image logic: 
  // 1. If a complete variant is selected (size+color), show its images.
  // 2. If only color is selected (or size+color but variant has no specific images), try to find images for that color.
  // 3. If NO selection, default to the FIRST variant's images.
  // 4. Fallback to product images.

  const selectedColorImages = selectedColor
    ? product.variants?.find(v => v.color === selectedColor && v.images?.length > 0)?.images
    : null

  const currentImages = (selectedVariant?.images && selectedVariant.images.length > 0)
    ? selectedVariant.images
    : (selectedColorImages && selectedColorImages.length > 0)
      ? selectedColorImages
      : (product.variants?.length > 0 && product.variants[0].images?.length > 0)
        ? product.variants[0].images
        : (product.images || [])

  const currentPrice = selectedVariant?.price || product.price || 0

  // Stock logic for the badge/display: show In Stock if ANY variant has stock
  const isAnyVariantInStock = product.variants?.some(v => v.stock > 0)
  const isDirectStockAvailable = product.stock > 0
  const isInStock = selectedVariant
    ? selectedVariant.stock > 0
    : (product.variants?.length > 0 ? isAnyVariantInStock : isDirectStockAvailable)

  console.log("Product ID:", product._id)
  console.log("Stock Status:", isInStock ? "In Stock" : "Out of Stock")
  console.log("Selected Variant Status:", selectedVariant ? "Selected" : "None")

  const handleAddToCart = async () => {
    if (!authState.isAuthenticated) {
      toast.error("Please login to add items to your cart")
      router.push('/login')
      return
    }

    const hasVariants = product.variants && product.variants.length > 0
    if (hasVariants && (!selectedSize || !selectedColor)) {
      toast.error("Please select both size and color before adding to cart")
      return
    }

    if (selectedVariant && selectedVariant.stock <= 0) {
      toast.error("Selected variant is out of stock")
      return
    }

    try {
      console.log("Submitting to cart:", {
        productId: product._id,
        quantity,
        color: selectedColor || 'Default',
        size: selectedSize || 'Default'
      })

      const result = await addToCartMutation.mutate({
        productId: product._id,
        quantity,
        color: selectedColor || 'Default',
        size: selectedSize || 'Default'
      })
      console.log("Add to cart result:", result)
      await syncWithBackend() // Refresh global cart state
      toast.success("Product added to cart!")
    } catch (error) {
      console.error("Add to cart failed:", error)
      toast.error(error.message || "Failed to add to cart")
    }
  }

  const handleAddToWishlist = async () => {
    if (!authState.isAuthenticated) {
      toast.error("Please login to add items to your wishlist")
      router.push('/login')
      return
    }
    try {
      await addToWishlistMutation.mutate(product._id)
      toast.success("Product added to wishlist!")
    } catch (error) {
      toast.error(error.message || "Failed to add to wishlist")
    }
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

      <main className="flex-1">
        <div className="container px-4 py-8 md:px-6 md:py-12 lg:px-18">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Image Gallery - Sticky on desktop */}
            <div className="lg:sticky lg:top-8 lg:self-start space-y-4">
              <div className="overflow-hidden w-full rounded-lg">
                <Image
                  src={currentImages[activeImage].url || "/placeholder.svg"}
                  alt={product.name}
                  width={450}
                  height={300}
                  className="object-cover  aspect-square transition-transform hover:scale-105" />
              </div>
              <div className="flex gap-2">
                {currentImages.map((image, index) => (
                  <button
                    key={index}
                    className={`overflow-hidden rounded-lg border ${activeImage === index ? "ring-2 ring-primary" : ""
                      }`}
                    onClick={() => setActiveImage(index)}>
                    <Image
                      src={image.url || "/placeholder.svg"}
                      alt={`${product.name} ${index + 1}`}
                      width={80}
                      height={80} />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Details - Scrollable */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold">{product.name}</h1>
                <div className="flex items-center gap-2 mt-2">
                  <p className="text-2xl font-semibold">Rs. {currentPrice.toFixed(2)}</p>
                  {product.category && (
                    <Badge variant="secondary">{product.category.name}</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={isInStock ? "default" : "destructive"}>
                    {isInStock ? "In Stock" : "Out of Stock"}
                  </Badge>
                  {product.vendor && (
                    <Badge variant="outline" className="text-muted-foreground">
                      {product.vendor}
                    </Badge>
                  )}
                  {product.averageRating && (
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500">★</span>
                      <span className="text-sm">{product.averageRating.toFixed(1)} ({product.reviews?.length || 0} reviews)</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-4">
                {product.variants && product.variants.length > 0 && (
                  <div className="space-y-4">
                    {/* Size Selection */}
                    {availableSizes.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Size
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {availableSizes.map((size) => {
                            const sizesWithThisSize = product.variants.filter(v => v.size === size)
                            const isAvailable = sizesWithThisSize.some(v => v.stock > 0)
                            const isSelected = selectedSize === size

                            return (
                              <button
                                key={size}
                                disabled={!isAvailable}
                                onClick={() => isAvailable && setSelectedSize(size)}
                                className={`
                                  min-w-[3rem] px-3 py-1.5 rounded-md border text-sm font-medium transition-all
                                  ${isSelected
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "bg-background hover:bg-muted border-input text-foreground"}
                                  ${!isAvailable ? "opacity-50 cursor-not-allowed decoration-slice" : ""}
                                `}
                              >
                                {size}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Color Selection */}
                    {availableColors.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Color
                        </label>
                        <div className="flex flex-wrap gap-3">
                          {availableColors.map((color) => {
                            const colorsWithThisColor = product.variants.filter(v => v.color === color)
                            const isAvailable = colorsWithThisColor.some(v => v.stock > 0)
                            const isSelected = selectedColor === color

                            // Find an image for this color
                            const variantWithImage = colorsWithThisColor.find(v => v.images && v.images.length > 0)
                            const colorImage = variantWithImage?.images?.[0]?.url

                            // Fallback color mapping
                            const colorMap = {
                              'Gold': '#FFD700',
                              'Silver': '#C0C0C0',
                              'Rose Gold': '#B76E79',
                              'Black': '#000000',
                              'White': '#FFFFFF',
                              'Red': '#FF0000',
                              'Green': '#008000',
                              'Blue': '#0000FF',
                              'Multicolor': 'linear-gradient(45deg, red, blue, green, yellow)'
                            }
                            const bgStyle = colorMap[color] || '#CCCCCC'

                            return (
                              <div key={color} className="flex flex-col items-center gap-1 group">
                                <button
                                  disabled={!isAvailable}
                                  onClick={() => isAvailable && setSelectedColor(color)}
                                  className={`
                                    w-12 h-12 rounded-md border-2 transition-all relative overflow-hidden
                                    ${isSelected ? "border-primary ring-2 ring-primary ring-offset-2" : "border-muted-foreground/20 hover:border-primary/50"}
                                    ${!isAvailable ? "opacity-40 cursor-not-allowed" : ""}
                                  `}
                                  title={color}
                                >
                                  {colorImage ? (
                                    <Image
                                      src={colorImage}
                                      alt={color}
                                      fill
                                      className="object-cover"
                                    />
                                  ) : (
                                    <div
                                      className="w-full h-full"
                                      style={{ background: bgStyle }}
                                    />
                                  )}

                                  {!isAvailable && (
                                    <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/30">
                                      <div className="w-full h-px bg-red-500 rotate-45 transform origin-center scale-125" />
                                    </div>
                                  )}
                                </button>
                                <span className={`text-[10px] ${isSelected ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                                  {color}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Selected Variant Info */}
                    {selectedVariant && (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium">Selected: {selectedSize} - {selectedColor}</p>
                        <p className="text-sm text-muted-foreground">
                          Price: ${selectedVariant.price.toFixed(2)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Stock: {selectedVariant.stock > 0 ? `${selectedVariant.stock} available` : 'Out of stock'}
                        </p>
                      </div>
                    )}
                  </div>
                )}
                <div className="pt-4 border-t">
                  <div className="flex flex-col gap-3">
                    {/* Quantity and Add to Cart Row */}
                    <div className="flex gap-4">
                      {/* Compact Quantity Selector */}
                      <div className="flex items-center border rounded-md h-12 flex-shrink-0">

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-full px-2 rounded-none hover:bg-transparent"
                          onClick={decreaseQuantity}
                          disabled={quantity <= 1}>
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center font-medium">{quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-full px-2 rounded-none hover:bg-transparent"
                          onClick={increaseQuantity}
                          disabled={quantity >= (selectedVariant?.stock || product.stock || 0)}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Main Add to Cart Button */}
                      <Button
                        className={`flex-1 h-12 text-base font-semibold shadow-md ${!selectedVariant && product.variants?.length > 0 ? "bg-muted text-muted-foreground" : ""}`}
                        onClick={handleAddToCart}
                        disabled={(!selectedVariant && product.variants?.length > 0) || !isInStock || addToCartMutation.loading}
                      >
                        {addToCartMutation.loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Adding...
                          </>
                        ) : !isInStock ? (
                          "Out of Stock"
                        ) : (!selectedVariant && product.variants?.length > 0) ? (
                          "Select Size & Color"
                        ) : (
                          <>
                            <ShoppingBag className="mr-2 h-5 w-5" />
                            Add to Cart
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Wishlist Button - Full Width */}
                    <Button
                      variant="outline"
                      className="w-full h-10 border-muted-foreground/20 hover:bg-secondary/50 hover:text-red-500"
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

                  {selectedVariant?.stock && selectedVariant.stock <= 10 && (
                    <p className="text-sm text-orange-500 mt-2 font-medium">
                      Hurry! Only {selectedVariant.stock} left in stock
                    </p>
                  )}
                </div>
              </div>
              <Separator />
              <Tabs defaultValue="details">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="policy">Return Policy</TabsTrigger>
                  <TabsTrigger value="care">Care</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                </TabsList>
                <TabsContent value="details" className="pt-4">
                  <div className="space-y-4">
                    <p className="text-muted-foreground">{product.description}</p>

                    <div>
                      <h4 className="font-semibold mb-2">Product Details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        {product.vendor && (
                          <div className="flex justify-between border-b pb-1">
                            <span className="text-muted-foreground">Vendor:</span>
                            <span>{product.vendor}</span>
                          </div>
                        )}
                        {product.productType && (
                          <div className="flex justify-between border-b pb-1">
                            <span className="text-muted-foreground">Type:</span>
                            <span>{product.productType}</span>
                          </div>
                        )}
                        {product.material && (
                          <div className="flex justify-between border-b pb-1">
                            <span className="text-muted-foreground">Material:</span>
                            <span>{product.material}</span>
                          </div>
                        )}
                        {/* Fallback for specifications if they exist in schema or API response */}
                        {product.specifications && Object.entries(product.specifications).map(([key, value]) => (
                          <div key={key} className="flex justify-between border-b pb-1">
                            <span className="text-muted-foreground capitalize">{key}:</span>
                            <span>{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </TabsContent>

                <TabsContent value="policy" className="pt-4">
                  <div className="space-y-4 text-sm">
                    <div>
                      <h4 className="font-semibold mb-2 text-base">Return & Replacement Policy</h4>
                      <div className="space-y-3 text-muted-foreground">
                        <div>
                          <p className="font-medium text-foreground mb-1">7-Day Return Window</p>
                          <p>Items can be returned within 7 days of delivery if they are unused, unworn, and in original packaging with all tags intact.</p>
                        </div>

                        <div>
                          <p className="font-medium text-foreground mb-1">Replacement Available</p>
                          <p>We offer free replacement for damaged, defective, or wrong items. Please contact us within 48 hours of delivery with photos of the issue.</p>
                        </div>

                        <div>
                          <p className="font-medium text-foreground mb-1">Non-Returnable Items</p>
                          <ul className="list-disc pl-5 space-y-1 mt-1">
                            <li>Customized or personalized bangles</li>
                            <li>Items showing signs of wear or damage</li>
                            <li>Products without original packaging or tags</li>
                          </ul>
                        </div>

                        <div>
                          <p className="font-medium text-foreground mb-1">Refund Process</p>
                          <p>Refunds will be processed within 5-7 business days after we receive and inspect the returned item. The amount will be credited to your original payment method.</p>
                        </div>

                        <div className="pt-2 border-t">
                          <p className="text-xs italic">For any queries regarding returns or replacements, please contact our customer support team.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="care" className="pt-4">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-3 text-base">Bangle Care Instructions</h4>
                      <div className="space-y-3 text-sm text-muted-foreground">
                        <div>
                          <p className="font-medium text-foreground mb-1">✨ Cleaning & Maintenance</p>
                          <ul className="list-disc pl-5 space-y-1">
                            <li>Clean with a soft, dry cloth after each use to remove dirt and oils</li>
                            <li>For deeper cleaning, use mild soap and lukewarm water, then dry immediately</li>
                            <li>Avoid harsh chemicals, perfumes, and cleaning agents that may damage the finish</li>
                          </ul>
                        </div>

                        <div>
                          <p className="font-medium text-foreground mb-1">💧 Water & Moisture</p>
                          <ul className="list-disc pl-5 space-y-1">
                            <li>Remove bangles before bathing, swimming, or doing dishes</li>
                            <li>Keep away from excessive moisture and humidity</li>
                            <li>If bangles get wet, dry them immediately with a soft cloth</li>
                          </ul>
                        </div>

                        <div>
                          <p className="font-medium text-foreground mb-1">📦 Storage</p>
                          <ul className="list-disc pl-5 space-y-1">
                            <li>Store in a cool, dry place away from direct sunlight</li>
                            <li>Keep each bangle separately in soft pouches to prevent scratches</li>
                            <li>Use anti-tarnish strips or silica gel packets in storage boxes</li>
                          </ul>
                        </div>

                        <div>
                          <p className="font-medium text-foreground mb-1">⚠️ Handling Tips</p>
                          <ul className="list-disc pl-5 space-y-1">
                            <li>Put on bangles after applying makeup, perfume, and hair products</li>
                            <li>Remove before exercising or engaging in physical activities</li>
                            <li>Handle with care to avoid dropping or knocking against hard surfaces</li>
                            <li>For delicate designs, avoid excessive pressure or bending</li>
                          </ul>
                        </div>

                        <div className="pt-2 border-t">
                          <p className="text-xs italic">Proper care will help maintain the beauty and longevity of your bangles for years to come.</p>
                        </div>
                      </div>
                    </div>
                  </div>
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
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4 lg:gap-6">
              {relatedProducts && relatedProducts.products ? (
                relatedProducts.products
                  .filter(p => p._id !== product._id)
                  .slice(0, 4)
                  .map((relatedProduct) => (
                    <Card key={relatedProduct._id} className="overflow-hidden pt-0">
                      <Link href={`/products/${relatedProduct._id}`}>
                        <Image
                          src={relatedProduct.images?.[0].url || "/placeholder.svg"}
                          alt={relatedProduct.name}
                          width={200}
                          height={200}
                          className="w-full aspect-square object-cover transition-transform hover:scale-105" />
                      </Link>
                      <CardContent className="">
                        <Link href={`/products/${relatedProduct._id}`}>
                          <h3 className="font-medium text-base leading-snug hover:text-primary transition-colors line-clamp-2 min-h-[2.5rem]">{relatedProduct.name}</h3>
                        </Link>
                        <p className="font-bold text-lg tracking-tight">Rs. {relatedProduct.price.toFixed(2)}</p>
                        {/* {relatedProduct.averageRating && (
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-yellow-500 text-sm">★</span>
                            <span className="text-sm text-muted-foreground">{relatedProduct.averageRating.toFixed(1)}</span>
                          </div>
                        )} */}
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
