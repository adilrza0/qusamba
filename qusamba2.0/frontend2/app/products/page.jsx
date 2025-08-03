"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Heart, Filter, ChevronDown, ShoppingBag, Search, Loader2, HeartIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UserMenu } from "@/components/user-menu"
import { useToast } from "@/components/ui/use-toast"

// Custom hooks
import { useApiEffect, useSearch } from "@/hooks/useApi"
import { useAuth } from "@/contexts/auth-context"
import { useCart } from "@/contexts/cart-context"
import { useWishlist } from "@/contexts/wishlist-context"
import { productsAPI as products, categoriesAPI as categories, cartAPI as cart, wishlistAPI as wishlist } from "@/services/api"

export default function ProductsPage() {
  const { state } = useAuth()
  const { user } = state
  const { toast } = useToast()
  const { state: cartState, dispatch: cartDispatch } = useCart()
  const { state: wishlistState, dispatch: wishlistDispatch } = useWishlist()
  
  // State for products and filters
  const [productsList, setProductsList] = useState([])
  const [categoriesList, setCategoriesList] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [processingActions, setProcessingActions] = useState({})
  const [selectedSizes, setSelectedSizes] = useState({})
  
  // Fetch products with filters
  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params = {
        page: currentPage,
        limit: 12,
        search: searchTerm,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        sort: sortBy
      }
      const response = await products.getAll(params)
      console.log(response)
      setProductsList(response.products || [])
      setTotalPages(response.pagination?.pages || 1)
    } catch (error) {
      console.error('Error fetching products:', error)
      setProductsList([])
      setTotalPages(1)
      toast({
        title: 'Error',
        description: 'Failed to load products. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }
  
  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await categories.getAll()
      setCategoriesList(response.data?.categories || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
      setCategoriesList([])
    }
  }
  
  // Sync with backend when user logs in
  const syncUserData = async () => {
    if (!user) return
    
    try {
      const [wishlistResponse, cartResponse] = await Promise.all([
        wishlist.get(),
        cart.get()
      ])
      console.log('Backend data available:', { wishlistResponse, cartResponse })
    } catch (apiError) {
      console.error('Error syncing user data:', apiError)
    }
  }
  
  // Handle wishlist toggle
  const handleWishlistToggle = async (productId) => {
    if (!user) {
      toast({
        title: 'Login required',
        description: 'Please login to add items to your wishlist.',
        variant: 'destructive'
      })
      return
    }
    
    setProcessingActions(prev => ({ ...prev, [`wishlist-${productId}`]: true }))
    
    try {
      const product = productsList.find(p => p._id === productId)
      if (!product) return
      
      const isInWishlist = wishlistState.items.some(item => item.id === productId)
      
      if (isInWishlist) {
        await wishlist.remove(productId)
      } else {
        await wishlist.add(productId)
      }
      
      // Update context state
      if (isInWishlist) {
        wishlistDispatch({
          type: "REMOVE_ITEM",
          payload: productId
        })
        toast({
          title: 'Removed from wishlist',
          description: 'Product removed from your wishlist.'
        })
      } else {
        wishlistDispatch({
          type: "ADD_ITEM",
          payload: {
            id: product._id,
            name: product.name,
            price: product.price,
            image: product.images?.[0]?.url,
            description: product.description,
            colors: product.variants?.map(v => v.color) || ['Default'],
            sizes: product.variants?.map(v => v.size) || ['Default']
          }
        })
        toast({
          title: 'Added to wishlist',
          description: 'Product added to your wishlist.'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update wishlist. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setProcessingActions(prev => ({ ...prev, [`wishlist-${productId}`]: false }))
    }
  }
  
  // Handle add to cart
  const handleAddToCart = async (productId, variant = null) => {
    if (!user) {
      toast({
        title: 'Login required',
        description: 'Please login to add items to your cart.',
        variant: 'destructive'
      })
      return
    }
    
    setProcessingActions(prev => ({ ...prev, [`cart-${productId}`]: true }))
    
    try {
      const product = productsList.find(p => p._id === productId)
      if (!product) return
      
      // Use selected size or default
      const selectedVariantId = selectedSizes[productId]
      const selectedVariant = selectedVariantId ? product.variants?.find(v => v._id === selectedVariantId) : null
      const defaultColor = selectedVariant?.color || product.variants?.[0]?.color || 'Default'
      const defaultSize = selectedVariant?.size || product.variants?.[0]?.size || 'Default'
      
      await cart.add(productId, 1, defaultColor, defaultSize)
      
      // Add to context
      cartDispatch({
        type: "ADD_ITEM",
        payload: {
          id: product._id,
          name: product.name,
          price: product.price,
          image: product.images?.[0]?.url,
          color: defaultColor,
          size: defaultSize
        }
      })
      
      toast({
        title: 'Added to cart',
        description: 'Product added to your cart successfully.'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add item to cart. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setProcessingActions(prev => ({ ...prev, [`cart-${productId}`]: false }))
    }
  }
  
  // Effect to fetch data on component mount and filter changes
  useEffect(() => {
    fetchProducts()
  }, [currentPage, searchTerm, selectedCategory, sortBy])
  
  useEffect(() => {
    fetchCategories()
    syncUserData()
  }, [user])
  
  // Debounced search
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      setCurrentPage(1)
      fetchProducts()
    }, 500)
    
    return () => clearTimeout(delayedSearch)
  }, [searchTerm])
  
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <div className="container px-4 py-8 md:px-6 md:py-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">All Bangles</h1>
              <p className="text-muted-foreground mt-1">Browse our collection of handcrafted bangles</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 mt-4 md:mt-0">
              <div className="relative">
                <Input 
                  placeholder="Search products..." 
                  className="w-full sm:w-[250px]" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    {selectedCategory ? categoriesList?.find(cat => cat._id === selectedCategory)?.name || 'Filter' : 'All Categories'}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                  <DropdownMenuItem onSelect={() => setSelectedCategory('')}>
                    All Categories
                  </DropdownMenuItem>
                  {categoriesList?.map((category) => (
                    <DropdownMenuItem 
                      key={category._id}
                      onSelect={() => setSelectedCategory(category._id)}
                    >
                      {category.name}
                    </DropdownMenuItem>
                  )) || []}
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    Sort: {sortBy === 'price' ? 'Price: Low to High' : 
                          sortBy === '-price' ? 'Price: High to Low' : 
                          sortBy === '-createdAt' ? 'Newest First' : 
                          sortBy === '-rating' ? 'Popularity' : 'Default'}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                  <DropdownMenuItem onSelect={() => setSortBy('createdAt')}>Default</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setSortBy('price')}>Price: Low to High</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setSortBy('-price')}>Price: High to Low</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setSortBy('-createdAt')}>Newest First</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setSortBy('-rating')}>Popularity</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <Separator className="mb-8" />
          <div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {productsList?.map((product) => (
              <Card key={product._id} className="overflow-hidden bg-accent">
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 z-10 rounded-full bg-white/80 backdrop-blur-sm"
                    aria-label="Add to wishlist"
                    onClick={() => handleWishlistToggle(product._id)}
                    disabled={processingActions[`wishlist-${product._id}`]}
                  >
                    <Heart className={`h-5 w-5 ${wishlistState.items.some(item => item.id === product._id) ? 'fill-red-500 text-red-500' : ''}`} />
                    <span className="sr-only">Add to wishlist</span>
                  </Button>
                  <Link href={`/products/${product._id}`}>
                    <Image
                      src={product.images?.[0]?.url || "/placeholder.svg"}
                      alt={product.name}
                      width={300}
                      height={300}
                      className="object-cover w-full aspect-square transition-transform hover:scale-105" />
                  </Link>
                </div>
                <CardContent className="p-4">
                  <Link href={`/products/${product._id}`}>
                    <h3 className="font-semibold text-lg">{product.name}</h3>
                  </Link>
                  <p className="text-sm text-muted-foreground mt-1">{product.description}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex flex-col">
                      <p className="font-medium">?{product.price.toFixed(2)}</p>
                      {product.rating && (
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-sm text-yellow-500">★</span>
                          <span className="text-sm text-muted-foreground">{product.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      {/* Size variants display */}
                      <div className="flex gap-1 flex-wrap">
                        {product.variants?.slice(0, 3).map((variant, index) => (
                          <span key={index} className="text-xs text-muted-foreground">
                            {variant.color} - {variant.size}
                          </span>
                        ))}
                        {product.variants?.length > 3 && (
                          <span className="text-xs text-muted-foreground">+{product.variants.length - 3} more</span>
                        )}
                      </div>
                      
                      {/* Size selection dropdown */}
                      {product.variants && product.variants.length > 0 && (
                        <Select 
                          value={selectedSizes[product._id] || ""} 
                          onValueChange={(value) => {
                            setSelectedSizes(prev => ({ ...prev, [product._id]: value }))
                          }}
                        >
                          <SelectTrigger className="w-full h-8 text-xs">
                            <SelectValue placeholder="Select size" />
                          </SelectTrigger>
                          <SelectContent>
                            {product.variants.map((variant) => (
                              <SelectItem key={variant._id} value={variant._id}>
                                Size: {variant.size} | Color: {variant.color} - ?{variant.price?.toFixed(2) || product.price.toFixed(2)}
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
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Button 
                    className="w-full" 
                    onClick={() => handleAddToCart(product._id)}
                    disabled={processingActions[`cart-${product._id}`]}
                  >
                    {processingActions[`cart-${product._id}`] ? 'Adding...' : 'Add to Cart'}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
