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
import { UserMenu } from "@/components/user-menu"
import { useToast } from "@/components/ui/use-toast"

// Custom hooks
import { useApiEffect, useSearch } from "@/hooks/useApi"
import { useAuth } from "@/contexts/auth-context"
import { productsAPI as products, categoriesAPI as categories, cartAPI as cart, wishlistAPI as wishlist } from "@/services/api"

export default function ProductsPage() {
  const { state } = useAuth()
  const { user } = state
  const { toast } = useToast()
  
  // State for products and filters
  const [productsList, setProductsList] = useState([])
  const [categoriesList, setCategoriesList] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [wishlistItems, setWishlistItems] = useState([])
  const [cartItems, setCartItems] = useState([])
  const [processingActions, setProcessingActions] = useState({})
  
  // Fetch products with filters
  const fetchProducts = async () => {
    try {
      setLoading(true)
      // Mock data for development
      const mockProducts = [
        {
          _id: '1',
          name: 'Golden Bangle Set',
          description: 'Beautiful handcrafted golden bangles',
          price: 299.99,
          rating: 4.5,
          images: [{ url: '/traditional.webp' }],
          variants: [{ color: 'Gold' }, { color: 'Silver' }]
        },
        {
          _id: '2',
          name: 'Silver Crystal Bangles',
          description: 'Elegant silver bangles with crystals',
          price: 199.99,
          rating: 4.8,
          images: [{ url: '/traditional.webp' }],
          variants: [{ color: 'Silver' }]
        }
      ]
      
      // Try API call, fallback to mock data
      try {
        const params = {
          page: currentPage,
          limit: 12,
          search: searchTerm,
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          sort: sortBy
        }
        const response = await products.getAll(params)
        console.log(response)
        setProductsList(response.products)
        setTotalPages(response.pagination.pages)
      } catch (apiError) {
        console.warn('API not available, using mock data:', apiError)
        setProductsList(mockProducts)
        setTotalPages(1)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
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
      // Mock data for development
      const mockCategories = [
        { _id: '1', name: 'Traditional' },
        { _id: '2', name: 'Modern' },
        { _id: '3', name: 'Festive' }
      ]
      
      try {
        const response = await categories.getAll()
        setCategoriesList(response.data.categories)
      } catch (apiError) {
        console.warn('Categories API not available, using mock data:', apiError)
        setCategoriesList(mockCategories)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }
  
  // Fetch user wishlist and cart if authenticated
  const fetchUserData = async () => {
    if (!user) return
    
    try {
      try {
        const [wishlistResponse, cartResponse] = await Promise.all([
          wishlist.get(),
          cart.get()
        ])
        
        setWishlistItems(wishlistResponse.data.items.map(item => item.product._id))
        setCartItems(cartResponse.data.items)
      } catch (apiError) {
        console.warn('User data API not available, using empty data:', apiError)
        setWishlistItems([])
        setCartItems([])
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
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
      const isInWishlist = wishlistItems.includes(productId)
      
      try {
        if (isInWishlist) {
          await wishlist.remove(productId)
        } else {
          await wishlist.add(productId)
        }
      } catch (apiError) {
        console.warn('Wishlist API not available, updating locally:', apiError)
      }
      
      // Update local state regardless of API success
      if (isInWishlist) {
        setWishlistItems(prev => prev.filter(id => id !== productId))
        toast({
          title: 'Removed from wishlist',
          description: 'Product removed from your wishlist.'
        })
      } else {
        setWishlistItems(prev => [...prev, productId])
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
      try {
        await cart.add(productId, 1)
        // Update cart items
        const cartResponse = await cart.get()
        setCartItems(cartResponse.data.items)
      } catch (apiError) {
        console.warn('Cart API not available, updating locally:', apiError)
        // Add to local cart state
        const product = productsList.find(p => p._id === productId)
        if (product) {
          setCartItems(prev => [...prev, { product, quantity: 1 }])
        }
      }
      
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
    fetchUserData()
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
              <Card key={product._id} className="overflow-hidden">
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 z-10 rounded-full bg-white/80 backdrop-blur-sm"
                    aria-label="Add to wishlist"
                    onClick={() => handleWishlistToggle(product._id)}
                    disabled={processingActions[`wishlist-${product._id}`]}
                  >
                    <Heart className={`h-5 w-5 ${wishlistItems.includes(product._id) ? 'fill-red-500 text-red-500' : ''}`} />
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
                      <p className="font-medium">${product.price.toFixed(2)}</p>
                      {product.rating && (
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-sm text-yellow-500">★</span>
                          <span className="text-sm text-muted-foreground">{product.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1">
                      {product.variants?.slice(0, 3).map((variant, index) => (
                        <span key={index} className="text-xs text-muted-foreground">
                          {variant.color}
                        </span>
                      ))}
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
