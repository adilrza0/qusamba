'use client'

import { useState } from 'react'
import { ShoppingCart, ChevronDown, ChevronLeft, ChevronRight, Filter } from "lucide-react"

import { Button } from "@/components/ui/button"
import traditional from  '../assets/traditional.webp'
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Link } from 'react-router-dom'
import { Img } from 'react-image'

// Mock data for products
const products = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  name: `Lac Bangle ${i + 1}`,
  price: Math.floor(Math.random() * (2000 - 500 + 1) + 500),
  category: ['Traditional', 'Modern', 'Bridal', 'Festive'][Math.floor(Math.random() * 4)],
  color: ['Red', 'Blue', 'Green', 'Gold', 'Multicolor'][Math.floor(Math.random() * 5)],
  image: traditional,
}))

const categories = ['Traditional', 'Modern', 'Bridal', 'Festive']
const colors = ['Red', 'Blue', 'Green', 'Gold', 'Multicolor']
const sortOptions = ['Newest', 'Price: Low to High', 'Price: High to Low']

export default function ProductListPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedCategories, setSelectedCategories] = useState([])
  const [selectedColors, setSelectedColors] = useState([])
  const [sortBy, setSortBy] = useState('Newest')
  const [priceRange, setPriceRange] = useState({ min: 0, max: 2000 })

  const itemsPerPage = 12

  const filteredProducts = products.filter(product => 
    (selectedCategories.length === 0 || selectedCategories.includes(product.category)) &&
    (selectedColors.length === 0 || selectedColors.includes(product.color)) &&
    (product.price >= priceRange.min && product.price <= priceRange.max)
  )

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'Price: Low to High') return a.price - b.price
    if (sortBy === 'Price: High to Low') return b.price - a.price
    return b.id - a.id // Newest
  })

  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage)
  const currentProducts = sortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b border-border">
        <Link className="flex items-center justify-center" href="#">
          <Img
            src="/placeholder.svg?height=40&width=40"
            width={40}
            height={40}
            alt="Qusamba Logo"
            className="rounded-full"
          />
          <span className="ml-2 text-2xl font-bold text-primary">Qusamba</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:text-primary" href="#">
            Home
          </Link>
          <Link className="text-sm font-medium hover:text-primary" href="#">
            Shop
          </Link>
          <Link className="text-sm font-medium hover:text-primary" href="#">
            About
          </Link>
          <Link className="text-sm font-medium hover:text-primary" href="#">
            Contact
          </Link>
        </nav>
        <Button variant="ghost" size="icon" className="ml-4">
          <ShoppingCart className="h-6 w-6" />
          <span className="sr-only">Shopping Cart</span>
        </Button>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Our Collection</h1>

        <div className="flex flex-col gap-6">
          {/* Filters and Sorting */}
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-4 items-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Filter className="mr-2 h-4 w-4" /> Filters
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>Categories</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {categories.map((category) => (
                    <DropdownMenuCheckboxItem
                      key={category}
                      checked={selectedCategories.includes(category)}
                      onCheckedChange={(checked) =>
                        setSelectedCategories(
                          checked
                            ? [...selectedCategories, category]
                            : selectedCategories.filter((c) => c !== category)
                        )
                      }
                    >
                      {category}
                    </DropdownMenuCheckboxItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Colors</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {colors.map((color) => (
                    <DropdownMenuCheckboxItem
                      key={color}
                      checked={selectedColors.includes(color)}
                      onCheckedChange={(checked) =>
                        setSelectedColors(
                          checked
                            ? [...selectedColors, color]
                            : selectedColors.filter((c) => c !== color)
                        )
                      }
                    >
                      {color}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  placeholder="Min Price"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
                  className="w-24"
                />
                <span>-</span>
                <Input
                  type="number"
                  placeholder="Max Price"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                  className="w-24"
                />
              </div>
            </div>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentProducts.map((product) => (
              <div key={product.id} className="bg-card rounded-lg shadow-md overflow-hidden">
                <Img
                  src={traditional}
                  alt={product.name}
                  width={300}
                  height={300}
                  className="object-cover w-full h-48"
                />
                <div className="p-4">
                  <h3 className="font-semibold mb-2">{product.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{product.category}</p>
                  <p className="text-primary font-bold">₹{product.price}</p>
                  <Button className="w-full mt-4">Add to Cart</Button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-8">
            <p className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * itemsPerPage + 1}-
              {Math.min(currentPage * itemsPerPage, sortedProducts.length)} of {sortedProducts.length} products
            </p>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="icon"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ))}
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-muted py-6">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-muted-foreground">
            © 2024 Qusamba. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}