"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { Heart, Filter, ChevronDown, ShoppingBag, Search, Loader2, HeartIcon, X } from "lucide-react"

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

import { Suspense } from "react"

function ProductsContent() {
  const { state } = useAuth()
  const { user } = state
  const { toast } = useToast()
  const { state: cartState, dispatch: cartDispatch } = useCart()
  const { state: wishlistState, dispatch: wishlistDispatch } = useWishlist()
  const router = useRouter()

  // State for products and filters
  const [productsList, setProductsList] = useState([])
  const [productTypes, setProductTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSize, setSelectedSize] = useState('all')
  const [selectedColor, setSelectedColor] = useState('all')
  const searchParams = useSearchParams()
  const typeParam = searchParams.get('type')
  const [selectedProductType, setSelectedProductType] = useState(typeParam || 'all')
  const [sortBy, setSortBy] = useState('name')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const categoryParam = searchParams.get('category')
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || 'all')
  const [processingActions, setProcessingActions] = useState({})
  const [selectedSizes, setSelectedSizes] = useState({})
  const [categoryName, setCategoryName] = useState('')

  // Common bangle sizes and colors for filtering
  const filterSizes = ['2.2', '2.4', '2.6', '2.8', '2.10', 'Adjustable']
  const filterColors = ['Gold', 'Silver', 'Rose Gold', 'Multicolor', 'Black', 'White']

  // Fetch products with filters
  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params = {
        page: currentPage,
        limit: 12,
        search: searchTerm,
        sort: sortBy
      }

      if (selectedCategory && selectedCategory !== 'all') {
        params.category = selectedCategory
      }

      if (selectedProductType && selectedProductType !== 'all') {
        params.productType = selectedProductType
      }

      if (selectedSize && selectedSize !== 'all') {
        params.size = selectedSize
      }

      if (selectedColor && selectedColor !== 'all') {
        params.color = selectedColor
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

  const handleWishlistToggle = async (productId) => {
    if (!state.isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please login to add items to your wishlist.",
        variant: "destructive"
      })
      router.push('/login')
      return
    }

    try {
      setProcessingActions(prev => ({ ...prev, [`wishlist-${productId}`]: true }))
      const isItemInWishlist = wishlistState.items.some(item => item._id === productId || item.id === productId)

      if (isItemInWishlist) {
        await wishlist.remove(productId)
        wishlistDispatch({ type: 'REMOVE_ITEM', payload: productId })
        toast({ title: 'Success', description: 'Removed from wishlist' })
      } else {
        await wishlist.add(productId)
        const product = productsList.find(p => p._id === productId)
        wishlistDispatch({
          type: 'ADD_ITEM',
          payload: {
            id: product._id,
            name: product.name,
            price: product.price,
            image: product.images?.[0]?.url
          }
        })
        toast({ title: 'Success', description: 'Added to wishlist' })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update wishlist',
        variant: 'destructive'
      })
    } finally {
      setProcessingActions(prev => ({ ...prev, [`wishlist-${productId}`]: false }))
    }
  }

  const handleAddToCart = async (productId) => {
    if (!state.isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please login to add items to your cart.",
        variant: "destructive"
      })
      router.push('/login')
      return
    }

    const selectedVariantId = selectedSizes[productId]
    const product = productsList.find(p => p._id === productId)

    if (product.variants?.length > 0 && !selectedVariantId) {
      toast({
        title: 'Selection Required',
        description: 'Please select a size/color variant.',
        variant: 'destructive'
      })
      return
    }

    try {
      setProcessingActions(prev => ({ ...prev, [`cart-${productId}`]: true }))

      const variant = product.variants?.find(v => v._id === selectedVariantId)
      const color = variant?.color || 'Default'
      const size = variant?.size || 'Default'

      await cart.add(productId, 1, color, size)

      cartDispatch({
        type: 'ADD_ITEM',
        payload: {
          id: productId,
          name: product.name,
          price: variant?.price || product.price,
          image: product.images?.[0]?.url,
          color,
          size,
          quantity: 1
        }
      })

      toast({ title: 'Success', description: 'Added to cart' })
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add to cart',
        variant: 'destructive'
      })
    } finally {
      setProcessingActions(prev => ({ ...prev, [`cart-${productId}`]: false }))
    }
  }

  // Effect to fetch initial data and filter changes
  useEffect(() => {
    fetchProducts()
  }, [currentPage, searchTerm, selectedProductType, selectedSize, selectedColor, sortBy, selectedCategory])

  useEffect(() => {
    const fetchCategoryName = async () => {
      if (selectedCategory && selectedCategory !== 'all') {
        try {
          const response = await categories.getById(selectedCategory)
          setCategoryName(response.data?.name || '')
        } catch (error) {
          console.error('Error fetching category:', error)
        }
      } else {
        setCategoryName('')
      }
    }
    fetchCategoryName()
  }, [selectedCategory])

  // Fetch product types on mount
  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const types = await products.getProductTypes()
        setProductTypes(types)
      } catch (error) {
        console.error('Error fetching types:', error)
      }
    }
    fetchTypes()
  }, [])

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <div className="container px-4 py-8 md:px-6 md:py-12">
          <div className="flex flex-col gap-6 mb-8">
            <div>
              <h1 className=" text-xl md:text-2xl lg:text-3xl  font-bold tracking-tight">All Bangles</h1>
              <p className="text-muted-foreground mt-1">Browse our collection of handcrafted bangles</p>
            </div>

            {/* Filters Bar */}
            {/* Filters Bar */}
            <div className="flex flex-col gap-4 mb-6">
              {/* Search - Full width on mobile */}
              <div className="relative w-full sm:max-w-[300px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  className="w-full pl-9 pr-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                  >
                    <span className="sr-only">Clear search</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18" /><path d="m6 6 18 12" /></svg>
                  </button>
                )}
                {loading && (
                  <Loader2 className="absolute right-8 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </div>

              {/* Filters & Sort - Grid on mobile, Flex on desktop */}
              <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">

                {/* Product Type Filter */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full sm:w-auto justify-between sm:justify-start">
                      <div className="flex items-center gap-2 truncate">
                        <Filter className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">
                          {selectedProductType !== 'all' ? selectedProductType : 'Type'}
                        </span>
                      </div>
                      <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[200px]">
                    <DropdownMenuItem onSelect={() => setSelectedProductType('all')}>All Types</DropdownMenuItem>
                    {productTypes?.map((type) => (
                      <DropdownMenuItem key={type.name} onSelect={() => setSelectedProductType(type.name)}>
                        {type.name}
                      </DropdownMenuItem>
                    )) || []}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Size Filter */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full sm:w-auto justify-between sm:justify-start">
                      <span className="truncate">
                        Size: {selectedSize === 'all' ? 'All' : selectedSize}
                      </span>
                      <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem onSelect={() => setSelectedSize('all')}>All Sizes</DropdownMenuItem>
                    {filterSizes.map((size) => (
                      <DropdownMenuItem key={size} onSelect={() => setSelectedSize(size)}>{size}</DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Color Filter */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full sm:w-auto justify-between sm:justify-start">
                      <span className="truncate">
                        Color: {selectedColor === 'all' ? 'All' : selectedColor}
                      </span>
                      <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem onSelect={() => setSelectedColor('all')}>All Colors</DropdownMenuItem>
                    {filterColors.map((color) => (
                      <DropdownMenuItem key={color} onSelect={() => setSelectedColor(color)}>{color}</DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Sort By */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full sm:w-auto justify-between sm:justify-start">
                      <span className="truncate">
                        Sort: {sortBy === 'price' ? 'Price: Low' :
                          sortBy === '-price' ? 'Price: High' :
                            sortBy === '-createdAt' ? 'Newest' :
                              sortBy === '-rating' ? 'Popular' : 'Default'}
                      </span>
                      <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0" />
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

                {/* Reset Filters */}
                {(selectedProductType !== 'all' || selectedSize !== 'all' || selectedColor !== 'all' || selectedCategory !== 'all' || searchTerm !== '') && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setSelectedProductType('all')
                      setSelectedSize('all')
                      setSelectedColor('all')
                      setSelectedCategory('all')
                      setSearchTerm('')
                      setCurrentPage(1)
                    }}
                    className="h-9 px-2 lg:px-3 text-muted-foreground hover:text-foreground"
                  >
                    Reset
                    <X className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Active Category Indicator */}
              {selectedCategory !== 'all' && categoryName && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Category:</span>
                  <div className="flex items-center gap-1 bg-accent px-2 py-1 rounded-md text-sm">
                    {categoryName}
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className="ml-1 hover:text-primary transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          <Separator className="mb-8" />
          <div
            className="grid grid-cols-2 w-full max-w-[95vw] mx-auto md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
            {productsList?.map((product) => (
              <Card key={product._id} className="group pt-0 relative flex flex-col justify-between overflow-hidden border-border/50 bg-card transition-all hover:shadow-xl hover:-translate-y-1">
                {/* Image Section */}
                <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                  {/* Badges */}
                  {product.stock <= 0 && (
                    <div className="absolute top-2 right-2 z-20">
                      <span className="bg-destructive/90 backdrop-blur-sm text-destructive-foreground px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-sm">Out of Stock</span>
                    </div>
                  )}
                  {product.stock > 0 && product.compare_at_price > product.price && (
                    <div className="absolute top-2 left-2 z-20">
                      <span className="bg-red-500/90 backdrop-blur-sm text-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-sm">Sale</span>
                    </div>
                  )}

                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute top-2 right-2 z-10 h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:text-red-500"
                    aria-label="Add to wishlist"
                    onClick={() => handleWishlistToggle(product._id)}
                    disabled={processingActions[`wishlist-${product._id}`]}
                  >
                    <Heart className={`h-4 w-4 ${wishlistState.items.some(item => item.id === product._id) ? 'fill-red-500 text-red-500' : ''}`} />
                  </Button>

                  <Link href={`/products/${product._id}`} className="block h-full w-full">
                    <Image
                      src={product.images?.[0]?.url || "/placeholder.svg"}
                      alt={product.name}
                      fill
                      className="object-cover h-full transition-transform duration-700 group-hover:scale-105"
                    />
                  </Link>
                </div>

                {/* Content Section */}
                <CardContent className="p-4 flex-1 flex flex-col gap-2.5">
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">{product.vendor || "Brand"}</p>
                    <Link href={`/products/${product._id}`} className="block">
                      <h3 className="font-medium text-base leading-snug hover:text-primary transition-colors line-clamp-2 min-h-[2.5rem]" title={product.name}>
                        {product.name}
                      </h3>
                    </Link>
                  </div>

                  <div className="flex items-end justify-between mt-auto pt-1">
                    <div className="flex flex-col">
                      <p className="font-bold text-lg tracking-tight">Rs. {product.price.toFixed(2)}</p>
                      {product.rating > 0 && (
                        <div className="flex items-center gap-0.5 mt-0.5">
                          <span className="text-yellow-500 text-xs">★</span>
                          <span className="text-xs text-muted-foreground font-medium ml-1">{product.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </div>


                </CardContent>

                <CardFooter className="p-4 pt-0 flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
                  {/* Size/Color Selectors (Compact) */}
                  <div className="w-full xl:w-auto xl:flex-1 xl:mr-2">
                    {(product.variants?.length > 0) && (
                      <Select
                        value={selectedSizes[product._id] || ""}
                        onValueChange={(value) => {
                          setSelectedSizes(prev => ({ ...prev, [product._id]: value }))
                        }}
                      >
                        <SelectTrigger className="w-full h-8 text-xs bg-secondary/30 border-secondary-foreground/10 hover:border-secondary-foreground/30 px-2 truncate">
                          <SelectValue placeholder="Select Option" />
                        </SelectTrigger>
                        <SelectContent>
                          {product.variants.map((variant) => (
                            <SelectItem key={variant._id} value={variant._id} className="text-xs">
                              {variant.color} / {variant.size} - Rs. {variant.price?.toFixed(2)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  <Button
                    className="w-full xl:w-auto font-medium shadow-sm transition-all text-xs h-9 uppercase tracking-wide"
                    onClick={() => handleAddToCart(product._id)}
                    disabled={processingActions[`cart-${product._id}`] || product.stock <= 0}
                    variant={product.stock <= 0 ? "secondary" : "default"}
                  >
                    {processingActions[`cart-${product._id}`] ? (
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    ) : (
                      product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) ? (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="w-10"
                    >
                      {page}
                    </Button>
                  ) : (
                    page === currentPage - 2 || page === currentPage + 2 ? <span key={page} className="px-1">...</span> : null
                  )
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="flex h-screen w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <ProductsContent />
    </Suspense>
  )
}
