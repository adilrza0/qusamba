"use client";
import { useState, useEffect } from "react"
import { Edit, MoreHorizontal, Plus, Search, Trash2, Upload, X, ImageIcon, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { productsAPI, categoriesAPI } from "@/services/api"

export function AdminProducts() {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [isAddProductOpen, setIsAddProductOpen] = useState(false)
  const [isEditProductOpen, setIsEditProductOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [productTypes, setProductTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedImages, setSelectedImages] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedProductType, setSelectedProductType] = useState('all')
  const [selectedSize, setSelectedSize] = useState('all')
  const [selectedColor, setSelectedColor] = useState('all')
  const [sortBy, setSortBy] = useState('-createdAt')
  // Common bangle sizes and colors for filtering (synced with user-side)
  const filterSizes = ['2.2', '2.4', '2.6', '2.8', '2.10', 'Adjustable']
  const filterColors = ['Gold', 'Silver', 'Rose Gold', 'Multicolor', 'Black', 'White']

  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    material: "",
    sku: "",
    variants: []
  })
  const [currentVariant, setCurrentVariant] = useState({
    color: "",
    size: "",
    stock: "",
    price: "",
    sku: "",
    images: []
  })
  const [variantImages, setVariantImages] = useState([])
  const [variantImagePreviews, setVariantImagePreviews] = useState([])
  const [showVariantForm, setShowVariantForm] = useState(false)

  const { toast } = useToast()

  // Fetch products and categories from backend
  useEffect(() => {
    fetchProducts()
    fetchCategories()
    fetchProductTypes()
  }, [currentPage, searchTerm, categoryFilter, selectedProductType, selectedSize, selectedColor, sortBy])

  const fetchProductTypes = async () => {
    try {
      const types = await productsAPI.getProductTypes()
      setProductTypes(types || [])
    } catch (error) {
      console.error('Error fetching product types:', error)
    }
  }

  const fetchProducts = async () => {
    try {
      const params = {
        page: currentPage,
        limit: 12,
        search: searchTerm,
        sort: sortBy
      }

      if (categoryFilter && categoryFilter !== 'all') {
        params.category = categoryFilter
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

      setLoading(true)
      console.log('Fetching products...')
      // Call the API to get all products
      const response = await productsAPI.getAll(params)
      console.log('Products fetched:', response.products)
      setProducts(response.products || [])
    } catch (error) {
      console.error('Error fetching products:', error)
      setProducts([])
      toast({
        title: "Error",
        description: "Failed to fetch products. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAll()
      setCategories(response.data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
      setCategories([])
    }
  }

  const filteredProducts = products // Use products directly as server-side filtering is now synced

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewProduct({ ...newProduct, [name]: value })
  }

  const handleSelectChange = (name, value) => {
    setNewProduct({ ...newProduct, [name]: value })
  }

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files)
    setSelectedImages(files)

    // Create preview URLs
    const previews = files.map(file => URL.createObjectURL(file))
    setImagePreviews(previews)
  }

  const removeImage = (index) => {
    const newImages = selectedImages.filter((_, i) => i !== index)
    const newPreviews = imagePreviews.filter((_, i) => i !== index)
    setSelectedImages(newImages)
    setImagePreviews(newPreviews)
  }

  // Variant image handling
  const handleVariantImageSelect = (e) => {
    const files = Array.from(e.target.files)
    setVariantImages(files)

    // Create preview URLs
    const previews = files.map(file => URL.createObjectURL(file))
    setVariantImagePreviews(previews)
  }

  const removeVariantImage = (index) => {
    const newImages = variantImages.filter((_, i) => i !== index)
    const newPreviews = variantImagePreviews.filter((_, i) => i !== index)
    setVariantImages(newImages)
    setVariantImagePreviews(newPreviews)
  }

  // Variant management
  const handleVariantInputChange = (e) => {
    const { name, value } = e.target
    setCurrentVariant({ ...currentVariant, [name]: value })
  }

  const addVariant = () => {
    if (!currentVariant.color || !currentVariant.size || !currentVariant.stock || !currentVariant.price) {
      alert('Please fill in all variant fields')
      return
    }

    const variantWithImages = {
      ...currentVariant,
      images: variantImages,
      id: Date.now() // temporary ID for frontend management
    }

    setNewProduct({
      ...newProduct,
      variants: [...newProduct.variants, variantWithImages]
    })

    // Reset variant form
    setCurrentVariant({
      color: "",
      size: "",
      stock: "",
      price: "",
      sku: "",
      images: []
    })
    setVariantImages([])
    setVariantImagePreviews([])
    setShowVariantForm(false)
  }

  const removeVariant = (index) => {
    const newVariants = newProduct.variants.filter((_, i) => i !== index)
    setNewProduct({ ...newProduct, variants: newVariants })
  }

  const handleAddProduct = async () => {
    try {
      setUploadProgress(0)

      const formData = new FormData()
      formData.append('name', newProduct.name)
      formData.append('description', newProduct.description)
      formData.append('price', newProduct.price)
      formData.append('category', newProduct.category)
      formData.append('stock', newProduct.stock)
      formData.append('material', newProduct.material)
      formData.append('sku', newProduct.sku)

      // Add main product images
      selectedImages.forEach((image, index) => {
        formData.append('images', image)
      })

      // Add variants data
      if (newProduct.variants.length > 0) {
        formData.append('variants', JSON.stringify(newProduct.variants.map(variant => ({
          color: variant.color,
          size: variant.size,
          stock: variant.stock,
          price: variant.price,
          sku: variant.sku
        }))))

        // Add variant images
        newProduct.variants.forEach((variant, variantIndex) => {
          variant.images.forEach((image, imageIndex) => {
            formData.append(`variant_${variantIndex}_images`, image)
          })
        })
      }

      const response = await productsAPI.create(formData)

      // Reset form and close dialog
      setIsAddProductOpen(false)
      resetForm()

      // Refresh products list
      fetchProducts()

      toast({
        title: "Success",
        description: "Product added successfully."
      })

    } catch (error) {
      console.error('Error adding product:', error)
      toast({
        title: "Error",
        description: "Failed to add product. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleEditProduct = (product) => {
    setEditingProduct(product)
    setNewProduct({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      stock: product.stock.toString(),
      material: product.material || "",
      sku: product.sku || "",
    })
    setIsEditProductOpen(true)
  }

  const handleUpdateProduct = async () => {
    try {
      setUploadProgress(0)

      const formData = new FormData()
      formData.append('name', newProduct.name)
      formData.append('description', newProduct.description)
      formData.append('price', newProduct.price)
      formData.append('category', newProduct.category)
      formData.append('stock', newProduct.stock)
      formData.append('material', newProduct.material)
      formData.append('sku', newProduct.sku)

      // Add new images if any
      selectedImages.forEach((image, index) => {
        formData.append('images', image)
      })

      const response = await productsAPI.update(editingProduct._id, formData)

      // Reset form and close dialog
      setIsEditProductOpen(false)
      setEditingProduct(null)
      resetForm()

      // Refresh products list
      fetchProducts()

      toast({
        title: "Success",
        description: "Product updated successfully."
      })

    } catch (error) {
      console.error('Error updating product:', error)
      toast({
        title: "Error",
        description: "Failed to update product. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productsAPI.delete(productId)

        // Refresh products list
        fetchProducts()

        toast({
          title: "Success",
          description: "Product deleted successfully."
        })

      } catch (error) {
        console.error('Error deleting product:', error)
        toast({
          title: "Error",
          description: "Failed to delete product. Please try again.",
          variant: "destructive"
        })
      }
    }
  }

  const resetForm = () => {
    setNewProduct({
      name: "",
      description: "",
      price: "",
      category: "",
      stock: "",
      material: "",
      sku: "",
      variants: []
    })
    setCurrentVariant({
      color: "",
      size: "",
      stock: "",
      price: "",
      sku: "",
      images: []
    })
    setSelectedImages([])
    setImagePreviews([])
    setVariantImages([])
    setVariantImagePreviews([])
    setShowVariantForm(false)
    setUploadProgress(0)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getStockStatus = (stock) => {
    if (stock <= 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-800' }
    if (stock <= 5) return { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-800' }
    return { label: 'In Stock', color: 'bg-green-100 text-green-800' }
  }

  return (
    (<div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Products</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              className="w-full md:w-[300px] pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category._id} value={category._id}>{category.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Product Type Filter */}
          <Select value={selectedProductType} onValueChange={setSelectedProductType}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {productTypes?.map((type) => (
                <SelectItem key={type.name} value={type.name}>{type.name}</SelectItem>
              )) || []}
            </SelectContent>
          </Select>

          {/* Size Filter */}
          <Select value={selectedSize} onValueChange={setSelectedSize}>
            <SelectTrigger className="w-[110px]">
              <SelectValue placeholder="Size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sizes</SelectItem>
              {filterSizes.map((size) => (
                <SelectItem key={size} value={size}>{size}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Color Filter */}
          <Select value={selectedColor} onValueChange={setSelectedColor}>
            <SelectTrigger className="w-[110px]">
              <SelectValue placeholder="Color" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Colors</SelectItem>
              {filterColors.map((color) => (
                <SelectItem key={color} value={color}>{color}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort By */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="-createdAt">Newest First</SelectItem>
              <SelectItem value="createdAt">Oldest First</SelectItem>
              <SelectItem value="price">Price: Low to High</SelectItem>
              <SelectItem value="-price">Price: High to Low</SelectItem>
              <SelectItem value="-rating">Popularity</SelectItem>
            </SelectContent>
          </Select>

          {/* Reset Filters */}
          {(categoryFilter !== 'all' || selectedProductType !== 'all' || selectedSize !== 'all' || selectedColor !== 'all' || searchTerm !== '') && (
            <Button
              variant="ghost"
              onClick={() => {
                setCategoryFilter('all')
                setSelectedProductType('all')
                setSelectedSize('all')
                setSelectedColor('all')
                setSortBy('-createdAt')
                setSearchTerm('')
                setCurrentPage(1)
              }}
              className="h-9 px-2 text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}

          <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
                <DialogDescription>Fill in the details below to add a new product to your inventory.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={newProduct.name}
                    onChange={handleInputChange}
                    className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={newProduct.description}
                    onChange={handleInputChange}
                    className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="price" className="text-right">
                    Price
                  </Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    value={newProduct.price}
                    onChange={handleInputChange}
                    className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right">
                    Category
                  </Label>
                  <Select
                    value={newProduct.category}
                    onValueChange={(value) => handleSelectChange("category", value)}>
                    <SelectTrigger id="category" className="col-span-3">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category._id} value={category._id}>{category.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="stock" className="text-right">
                    Stock
                  </Label>
                  <Input
                    id="stock"
                    name="stock"
                    type="number"
                    value={newProduct.stock}
                    onChange={handleInputChange}
                    className="col-span-3" />
                </div>

                {/* Variant Management Section */}
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label className="text-right mt-2">Variants</Label>
                  <div className="col-span-3 space-y-4">
                    {/* Existing Variants Display */}
                    {newProduct.variants && newProduct.variants.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-semibold">Added Variants:</h4>
                        {newProduct.variants.map((variant, index) => (
                          <div key={index} className="border p-3 rounded bg-gray-50">
                            <div className="flex justify-between items-center">
                              <span className="font-medium">{variant.color} / {variant.size} - ?{variant.price}</span>
                              <Button type="button" onClick={() => removeVariant(index)} variant="destructive" size="sm">
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="text-sm text-gray-600">Stock: {variant.stock} | SKU: {variant.sku}</div>
                            <div className="text-sm text-gray-600">Images: {variant.images.length} uploaded</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Variant Button */}
                    <Button type="button" onClick={() => setShowVariantForm(true)} variant="outline" className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Variant
                    </Button>

                    {/* Variant Form */}
                    {showVariantForm && (
                      <div className="border p-4 rounded bg-blue-50">
                        <h4 className="font-semibold mb-4">New Variant Details</h4>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="variant-color">Color</Label>
                              <Input id="variant-color" name="color" value={currentVariant.color} onChange={handleVariantInputChange} placeholder="e.g., Red, Blue" />
                            </div>
                            <div>
                              <Label htmlFor="variant-size">Size</Label>
                              <Input id="variant-size" name="size" value={currentVariant.size} onChange={handleVariantInputChange} placeholder="e.g., S, M, L" />
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor="variant-stock">Stock</Label>
                              <Input id="variant-stock" name="stock" type="number" value={currentVariant.stock} onChange={handleVariantInputChange} placeholder="0" />
                            </div>
                            <div>
                              <Label htmlFor="variant-price">Price</Label>
                              <Input id="variant-price" name="price" type="number" step="0.01" value={currentVariant.price} onChange={handleVariantInputChange} placeholder="0.00" />
                            </div>
                            <div>
                              <Label htmlFor="variant-sku">SKU (Optional)</Label>
                              <Input id="variant-sku" name="sku" value={currentVariant.sku} onChange={handleVariantInputChange} placeholder="Leave empty to auto-generate" />
                            </div>
                          </div>

                          {/* Variant Image Upload */}
                          <div>
                            <Label htmlFor="variant-images">Images for this Color</Label>
                            <div className="flex items-center gap-2 mt-2">
                              <Input
                                id="variant-images"
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleVariantImageSelect}
                                className="flex-1"
                              />
                              <Button type="button" variant="outline" size="sm">
                                <Upload className="h-4 w-4 mr-2" />
                                Browse
                              </Button>
                            </div>

                            {/* Variant Image Previews */}
                            {variantImagePreviews.length > 0 && (
                              <div className="grid grid-cols-4 gap-2 mt-2">
                                {variantImagePreviews.map((preview, index) => (
                                  <div key={index} className="relative group">
                                    <img
                                      src={preview}
                                      alt={`Preview ${index + 1}`}
                                      className="w-full h-16 object-cover rounded border"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => removeVariantImage(index)}
                                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="flex justify-end gap-2">
                            <Button type="button" onClick={() => setShowVariantForm(false)} variant="outline">
                              Cancel
                            </Button>
                            <Button type="button" onClick={addVariant}>
                              Add Variant
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Image Upload Section */}
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="images" className="text-right mt-2">
                    Images
                  </Label>
                  <div className="col-span-3 space-y-4">
                    <div className="flex items-center gap-2">
                      <Input
                        id="images"
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="flex-1"
                      />
                      <Button type="button" variant="outline" size="sm">
                        <Upload className="h-4 w-4 mr-2" />
                        Browse
                      </Button>
                    </div>

                    {/* Image Previews */}
                    {imagePreviews.length > 0 && (
                      <div className="grid grid-cols-3 gap-2">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-20 object-cover rounded border"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Upload Progress */}
                    {uploadProgress > 0 && uploadProgress < 100 && (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => {
                  setIsAddProductOpen(false)
                  resetForm()
                }}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  onClick={handleAddProduct}
                  disabled={uploadProgress > 0 && uploadProgress < 100}
                >
                  {uploadProgress > 0 && uploadProgress < 100 ? (
                    <>Uploading... {uploadProgress}%</>
                  ) : (
                    <>Add Product</>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Product Dialog */}
          <Dialog open={isEditProductOpen} onOpenChange={setIsEditProductOpen}>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Product</DialogTitle>
                <DialogDescription>Update the product details below.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="edit-name"
                    name="name"
                    value={newProduct.name}
                    onChange={handleInputChange}
                    className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-description" className="text-right">
                    Description
                  </Label>
                  <Textarea
                    id="edit-description"
                    name="description"
                    value={newProduct.description}
                    onChange={handleInputChange}
                    className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-price" className="text-right">
                    Price
                  </Label>
                  <Input
                    id="edit-price"
                    name="price"
                    type="number"
                    value={newProduct.price}
                    onChange={handleInputChange}
                    className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-category" className="text-right">
                    Category
                  </Label>
                  <Select
                    value={newProduct.category}
                    onValueChange={(value) => handleSelectChange("category", value)}>
                    <SelectTrigger id="edit-category" className="col-span-3">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category._id} value={category.name}>{category.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-stock" className="text-right">
                    Stock
                  </Label>
                  <Input
                    id="edit-stock"
                    name="stock"
                    type="number"
                    value={newProduct.stock}
                    onChange={handleInputChange}
                    className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-material" className="text-right">
                    Material
                  </Label>
                  <Input
                    id="edit-material"
                    name="material"
                    value={newProduct.material}
                    onChange={handleInputChange}
                    className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-sku" className="text-right">
                    SKU
                  </Label>
                  <Input
                    id="edit-sku"
                    name="sku"
                    value={newProduct.sku}
                    onChange={handleInputChange}
                    className="col-span-3" />
                </div>

                {/* Current Images */}
                {editingProduct?.images?.length > 0 && (
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label className="text-right mt-2">
                      Current Images
                    </Label>
                    <div className="col-span-3">
                      <div className="grid grid-cols-3 gap-2">
                        {editingProduct.images.map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={image.url}
                              alt={`Product image ${index + 1}`}
                              className="w-full h-20 object-cover rounded border"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* New Images Upload */}
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="edit-images" className="text-right mt-2">
                    Add New Images
                  </Label>
                  <div className="col-span-3 space-y-4">
                    <div className="flex items-center gap-2">
                      <Input
                        id="edit-images"
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="flex-1"
                      />
                      <Button type="button" variant="outline" size="sm">
                        <Upload className="h-4 w-4 mr-2" />
                        Browse
                      </Button>
                    </div>

                    {/* New Image Previews */}
                    {imagePreviews.length > 0 && (
                      <div className="grid grid-cols-3 gap-2">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-20 object-cover rounded border"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Upload Progress */}
                    {uploadProgress > 0 && uploadProgress < 100 && (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => {
                  setIsEditProductOpen(false)
                  setEditingProduct(null)
                  resetForm()
                }}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  onClick={handleUpdateProduct}
                  disabled={uploadProgress > 0 && uploadProgress < 100}
                >
                  {uploadProgress > 0 && uploadProgress < 100 ? (
                    <>Updating... {uploadProgress}%</>
                  ) : (
                    <>Update Product</>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="hidden sm:table-cell">Category</TableHead>
              <TableHead className="hidden sm:table-cell">Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Loading products...
                </TableCell>
              </TableRow>
            ) : filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  No products found.
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                console.log(product._id),
                <TableRow key={product._id}>
                  <TableCell>
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0].url}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">
                    {product.name.split(' ').slice(0, 10).join(' ')}
                    {product.name.split(' ').length > 10 ? '...' : ''}
                  </TableCell>
                  <TableCell>Rs. {product.price.toFixed(2)}</TableCell>
                  <TableCell className="hidden sm:table-cell">{product.category.name}</TableCell>
                  <TableCell className="hidden sm:table-cell">{product.stock}</TableCell>
                  <TableCell>
                    <div
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${product.stock > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}>
                      {product.stock > 0 ? "In Stock" : "Out of Stock"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleEditProduct(product)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDeleteProduct(product._id)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>)
  );
}
