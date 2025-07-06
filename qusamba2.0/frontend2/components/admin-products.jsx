"use client";
import { useState, useEffect } from "react"
import { Edit, MoreHorizontal, Plus, Search, Trash2, Upload, X, ImageIcon } from "lucide-react"

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
import { useAuth } from "@/contexts/auth-context"
import { useForm } from "react-hook-form";
import axios from "axios";

// API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Categories for the select dropdown
const CATEGORIES = ['Premium', 'Luxury', 'Casual', 'Vintage'];

export function AdminProducts() {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [isAddProductOpen, setIsAddProductOpen] = useState(false)
  const [isEditProductOpen, setIsEditProductOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedImages, setSelectedImages] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
  })
  
  const { user } = useAuth()

  // Fetch products from backend
  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_BASE_URL}/products`)
      setProducts(response.data.products || [])
    } catch (error) {
      console.error('Error fetching products:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter

    return matchesSearch && matchesCategory
  })

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

  const handleAddProduct = async () => {
    try {
      setUploadProgress(0)
      
      const formData = new FormData()
      formData.append('name', newProduct.name)
      formData.append('description', newProduct.description)
      formData.append('price', newProduct.price)
      formData.append('category', newProduct.category)
      formData.append('stock', newProduct.stock)
      
      // Add images to form data
      selectedImages.forEach((image, index) => {
        formData.append('images', image)
      })
      const token = localStorage.getItem('qusamba-token');
      const response = await axios.post(`${API_BASE_URL}/products`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          )
          setUploadProgress(percentCompleted)
        }
      })
      
      // Reset form and close dialog
      setIsAddProductOpen(false)
      setNewProduct({
        name: "",
        description: "",
        price: "",
        category: "",
        stock: "",
      })
      setSelectedImages([])
      setImagePreviews([])
      setUploadProgress(0)
      
      // Refresh products list
      fetchProducts()
      
    } catch (error) {
      console.error('Error adding product:', error)
      alert('Error adding product. Please try again.')
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
      
      // Add new images if any
      selectedImages.forEach((image, index) => {
        formData.append('images', image)
      })
      
      const token = localStorage.getItem('qusamba-token');
      const response = await axios.put(`${API_BASE_URL}/products/${editingProduct._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          )
          setUploadProgress(percentCompleted)
        }
      })
      
      // Reset form and close dialog
      setIsEditProductOpen(false)
      setEditingProduct(null)
      setNewProduct({
        name: "",
        description: "",
        price: "",
        category: "",
        stock: "",
      })
      setSelectedImages([])
      setImagePreviews([])
      setUploadProgress(0)
      
      // Refresh products list
      fetchProducts()
      
    } catch (error) {
      console.error('Error updating product:', error)
      alert('Error updating product. Please try again.')
    }
  }

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const token = localStorage.getItem('qusamba-token');
        await axios.delete(`${API_BASE_URL}/products/${productId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        // Refresh products list
        fetchProducts()
        
      } catch (error) {
        console.error('Error deleting product:', error)
        alert('Error deleting product. Please try again.')
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
    })
    setSelectedImages([])
    setImagePreviews([])
    setUploadProgress(0)
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
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
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
                      {CATEGORIES.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
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
                      {CATEGORIES.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
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
              <TableHead className="hidden md:table-cell">Description</TableHead>
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
                <TableCell colSpan={8} className="text-center py-8">
                  Loading products...
                </TableCell>
              </TableRow>
            ) : filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  No products found.
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
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
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <p className="truncate max-w-[300px]">{product.description}</p>
                  </TableCell>
                  <TableCell>${product.price.toFixed(2)}</TableCell>
                  <TableCell className="hidden sm:table-cell">{product.category}</TableCell>
                  <TableCell className="hidden sm:table-cell">{product.stock}</TableCell>
                  <TableCell>
                    <div
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        product.stock > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
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
