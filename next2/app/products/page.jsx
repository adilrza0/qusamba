import Link from "next/link"
import Image from "next/image"
import { Heart, Filter, ChevronDown, ShoppingBag } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { UserMenu } from "@/components/user-menu"

// Mock data for products
const products = [
  {
    id: 1,
    name: "Golden Elegance",
    description: "24K gold-plated bangle with intricate design",
    price: 129.99,
    image: "/placeholder.svg?height=300&width=300",
    colors: ["Gold", "Rose Gold"],
    sizes: ["Small", "Medium", "Large"],
    category: "Premium",
  },
  {
    id: 2,
    name: "Silver Serenity",
    description: "Sterling silver bangle with pearl accents",
    price: 89.99,
    image: "/placeholder.svg?height=300&width=300",
    colors: ["Silver"],
    sizes: ["Small", "Medium", "Large"],
    category: "Premium",
  },
  {
    id: 3,
    name: "Bohemian Dream",
    description: "Colorful beaded bangle with wooden accents",
    price: 49.99,
    image: "/placeholder.svg?height=300&width=300",
    colors: ["Multicolor"],
    sizes: ["One Size"],
    category: "Casual",
  },
  {
    id: 4,
    name: "Crystal Charm",
    description: "Elegant crystal-studded bangle for special occasions",
    price: 159.99,
    image: "/placeholder.svg?height=300&width=300",
    colors: ["Silver", "Gold"],
    sizes: ["Small", "Medium"],
    category: "Luxury",
  },
  {
    id: 5,
    name: "Vintage Allure",
    description: "Antique-style bangle with vintage patterns",
    price: 79.99,
    image: "/placeholder.svg?height=300&width=300",
    colors: ["Bronze", "Copper"],
    sizes: ["Small", "Medium", "Large"],
    category: "Vintage",
  },
  {
    id: 6,
    name: "Modern Minimalist",
    description: "Clean, simple design for everyday wear",
    price: 59.99,
    image: "/placeholder.svg?height=300&width=300",
    colors: ["Silver", "Black", "Gold"],
    sizes: ["Small", "Medium", "Large"],
    category: "Casual",
  },
  {
    id: 7,
    name: "Floral Fantasy",
    description: "Bangle with delicate floral engravings",
    price: 99.99,
    image: "/placeholder.svg?height=300&width=300",
    colors: ["Silver", "Rose Gold"],
    sizes: ["Small", "Medium"],
    category: "Premium",
  },
  {
    id: 8,
    name: "Ocean Waves",
    description: "Blue-toned bangle inspired by ocean waves",
    price: 69.99,
    image: "/placeholder.svg?height=300&width=300",
    colors: ["Blue", "Teal"],
    sizes: ["Small", "Medium", "Large"],
    category: "Casual",
  },
]

export default function ProductsPage() {
  return (
    (<div className="flex flex-col min-h-screen">
      
      <main className="flex-1">
        <div className="container px-4 py-8 md:px-6 md:py-12">
          <div
            className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">All Bangles</h1>
              <p className="text-muted-foreground mt-1">Browse our collection of handcrafted bangles</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 mt-4 md:mt-0">
              <div className="relative">
                <Input placeholder="Search products..." className="w-full sm:w-[250px]" />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Filter
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                  <DropdownMenuItem>All Categories</DropdownMenuItem>
                  <DropdownMenuItem>Premium</DropdownMenuItem>
                  <DropdownMenuItem>Luxury</DropdownMenuItem>
                  <DropdownMenuItem>Casual</DropdownMenuItem>
                  <DropdownMenuItem>Vintage</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    Sort
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                  <DropdownMenuItem>Price: Low to High</DropdownMenuItem>
                  <DropdownMenuItem>Price: High to Low</DropdownMenuItem>
                  <DropdownMenuItem>Newest First</DropdownMenuItem>
                  <DropdownMenuItem>Popularity</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <Separator className="mb-8" />
          <div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 z-10 rounded-full bg-white/80 backdrop-blur-sm"
                    aria-label="Add to wishlist">
                    <Heart className="h-5 w-5" />
                    <span className="sr-only">Add to wishlist</span>
                  </Button>
                  <Link href={`/products/${product.id}`}>
                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      width={300}
                      height={300}
                      className="object-cover w-full aspect-square transition-transform hover:scale-105" />
                  </Link>
                </div>
                <CardContent className="p-4">
                  <Link href={`/products/${product.id}`}>
                    <h3 className="font-semibold text-lg">{product.name}</h3>
                  </Link>
                  <p className="text-sm text-muted-foreground mt-1">{product.description}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="font-medium">${product.price.toFixed(2)}</p>
                    <div className="flex gap-1">
                      {product.colors.map((color) => (
                        <span key={color} className="text-xs text-muted-foreground">
                          {color}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Button className="w-full">Add to Cart</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </main>
     
    </div>)
  );
}
