"use client"
import { useState } from 'react'
import { Star, Minus, Plus, ShoppingCart } from 'lucide-react'


import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'

import Image from 'next/image'
import Link from 'next/link'



export default function Shop() {
    const Bridal = '/bn5868.webp'
  const [quantity, setQuantity] = useState(1)

  const incrementQuantity = () => setQuantity(prev => prev + 1)
  const decrementQuantity = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1))

  return (
    <div className="flex flex-col min-h-screen">
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-4">
              <Image
                src={Bridal}
                alt="Elegant Lac Bangle"
                fill
                className="rounded-lg object-cover w-full h-[65vh] "
              />
              <div className="grid grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Image
                    key={i}
                    src={Bridal}
                    alt={`Lac Bangle View ${i}`}
                    fill
                   
                    className="rounded-lg object-cover h-[10vh] w-full"
                  />
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <h1 className="text-3xl font-bold">Elegant Floral Lac Bangle</h1>
              <div className="flex items-center">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-primary" />
                  ))}
                </div>
                <span className="ml-2 text-sm text-muted-foreground">(121 reviews)</span>
              </div>
              <p className="text-3xl font-bold">₹1,299</p>
              <p className="text-muted-foreground">
                This exquisite lac bangle features intricate floral designs, showcasing the rich tradition of Indian
                craftsmanship. Perfect for both everyday wear and special occasions, it adds a touch of elegance to any
                outfit.
              </p>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Color</h3>
                  <RadioGroup defaultValue="red" className="flex space-x-2">
                    {['red', 'green', 'blue', 'purple'].map((color) => (
                      <div key={color} className="flex items-center space-x-2">
                        <RadioGroupItem value={color} id={color} className="peer sr-only" />
                        <Label
                          htmlFor={color}
                          className={`w-8 h-8 rounded-full peer-checked:ring-2 ring-offset-2 ring-primary cursor-pointer bg-${color}-500`}
                        />
                      </div>
                    ))}
                  </RadioGroup>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Size</h3>
                  <RadioGroup defaultValue="medium" className="flex space-x-2">
                    {['Small', 'Medium', 'Large'].map((size) => (
                      <div key={size} className="flex items-center space-x-2">
                        <RadioGroupItem value={size.toLowerCase()} id={size} className="peer sr-only" />
                        <Label
                          htmlFor={size}
                          className="px-3 py-1 rounded-md border peer-checked:bg-primary peer-checked:text-primary-foreground cursor-pointer"
                        >
                          {size}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Quantity</h3>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="icon" onClick={decrementQuantity}>
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="text-xl font-semibold">{quantity}</span>
                    <Button variant="outline" size="icon" onClick={incrementQuantity}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <Button className="w-full" size="lg">
                Add to Cart
              </Button>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Product Details</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Handcrafted lac bangle</li>
                  <li>Intricate floral design</li>
                  <li>Available in multiple colors</li>
                  <li>Suitable for all occasions</li>
                  <li>Made in India</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">© 2024 Lac Bangles. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  )
}