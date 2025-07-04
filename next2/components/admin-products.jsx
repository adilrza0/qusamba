"use client";
import { useState } from "react"
import { Edit, MoreHorizontal, Plus, Search, Trash2 } from "lucide-react"

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

// Mock products data
const products = [
  {
    id: 1,
    name: "Golden Elegance",
    description: "24K gold-plated bangle with intricate design",
    price: 129.99,
    category: "Premium",
    stock: 15,
    status: "Active",
  },
  {
    id: 2,
    name: "Silver Serenity",
    description: "Sterling silver bangle with pearl accents",
    price: 89.99,
    category: "Premium",
    stock: 20,
    status: "Active",
  },
  {
    id: 3,
    name: "Bohemian Dream",
    description: "Colorful beaded bangle with wooden accents",
    price: 49.99,
    category: "Casual",
    stock: 30,
    status: "Active",
  },
  {
    id: 4,
    name: "Crystal Charm",
    description: "Elegant crystal-studded bangle for special occasions",
    price: 159.99,
    category: "Luxury",
    stock: 10,
    status: "Active",
  },
  {
    id: 5,
    name: "Vintage Allure",
    description: "Antique-style bangle with vintage patterns",
    price: 79.99,
    category: "Vintage",
    stock: 12,
    status: "Active",
  },
  {
    id: 6,
    name: "Modern Minimalist",
    description: "Clean, simple design for everyday wear",
    price: 59.99,
    category: "Casual",
    stock: 25,
    status: "Active",
  },
  {
    id: 7,
    name: "Floral Fantasy",
    description: "Bangle with delicate floral engravings",
    price: 99.99,
    category: "Premium",
    stock: 18,
    status: "Active",
  },
  {
    id: 8,
    name: "Ocean Waves",
    description: "Blue-toned bangle inspired by ocean waves",
    price: 69.99,
    category: "Casual",
    stock: 22,
    status: "Inactive",
  },
]

export function AdminProducts() {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [isAddProductOpen, setIsAddProductOpen] = useState(false)
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
  })

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

  const handleAddProduct = () => {
    // In a real app, this would add the product to the database
    console.log("Adding product:", newProduct)
    setIsAddProductOpen(false)
    setNewProduct({
      name: "",
      description: "",
      price: "",
      category: "",
      stock: "",
    })
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
              <SelectItem value="Premium">Premium</SelectItem>
              <SelectItem value="Luxury">Luxury</SelectItem>
              <SelectItem value="Casual">Casual</SelectItem>
              <SelectItem value="Vintage">Vintage</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
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
                      <SelectItem value="Premium">Premium</SelectItem>
                      <SelectItem value="Luxury">Luxury</SelectItem>
                      <SelectItem value="Casual">Casual</SelectItem>
                      <SelectItem value="Vintage">Vintage</SelectItem>
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
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleAddProduct}>
                  Add Product
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
            {filteredProducts.map((product) => (
              <TableRow key={product.id}>
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
                      product.status === "Active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}>
                    {product.status}
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
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>)
  );
}
