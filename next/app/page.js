'use client'

import { useState, useEffect } from 'react'
import { ShoppingCart, ChevronLeft, ChevronRight, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from 'next/link'
import Image from 'next/image'


const carouselItems = [
  {
    image: '/festival_banner_1.webp',
    title: "Timeless Elegance",
    description: "Adorn yourself with the rich heritage of lac bangles",
  },
  {
    image: '/main1-dt-int.webp',
    title: "Crafted Perfection",
    description: "Each bangle tells a story of artisanal excellence",
  },
  {
    image: '/main2.webp',
    title: "Celebrate in Style",
    description: "Elevate your festive look with our exquisite collection",
  },
]

const categories = [
  { name: "Traditional", image: '/traditional.webp' },
  { name: "Modern", image: '/bn7105.webp' },
  { name: "Bridal", image: '/bn5868.webp' },
  { name: "Festive", image: '/festive.webp' },
]

const featuredProducts = [
  { name: "Royal Blue Lac Bangle", price: 1299, image: "/traditional.webp" },
  { name: "Golden Floral Set", price: 1599, image: "/traditional.webp" },
  { name: "Ruby Red Bridal Bangles", price: 1899, image: "/traditional.webp" },
  { name: "Emerald Green Chunky Bangle", price: 1399, image: "/traditional.webp" },
]

function Carousel() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % carouselItems.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const goToSlide = (index) => {
    setCurrentIndex(index)
  }

  return (
    <div className="relative overflow-hidden w-full h-[400px] md:h-[600px]">
     
      {carouselItems.map((item, index) => (
        <div
          key={index}
          className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000 ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Image className='object-cover' priority src={item.image} fill alt={item.title}  />
          <div className="absolute  inset-0 bg-black/[40%]   flex items-center justify-center">
            <div className="text-center text-white">
              <h2 className="text-4xl md:text-6xl font-bold mb-4">{item.title}</h2>
              <p className="text-xl md:text-2xl mb-8">{item.description}</p>
              <Button size="lg" className="bg-primary hover:bg-primary-dark text-white">
                Shop Now
              </Button>
            </div>
          </div>
        </div>
      ))}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
        {carouselItems.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full ${
              index === currentIndex ? 'bg-white' : 'bg-white/50'
            }`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>
      <button
        className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-black/30 text-white p-2 rounded-full"
        onClick={() => goToSlide((currentIndex - 1 + carouselItems.length) % carouselItems.length)}
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-black/30 text-white p-2 rounded-full"
        onClick={() => goToSlide((currentIndex + 1) % carouselItems.length)}
      >
        <ChevronRight className="w-6 h-6" />
      </button>
    </div>
  )
}

export default function Homepage2() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      
      <main className="flex-1">
        
        <Carousel />
        <section className="w-full flex flex-col justify-center items-center py-12 md:py-24 lg:py-32 bg-accent">
        <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Discover the Beauty of Lac Bangles
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Handcrafted with love, our lac bangles bring traditional artistry to your modern style.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg">Shop Now</Button>
                  <Button size="lg" variant="outline">
                    Learn More
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full flex flex-col justify-center items-center py-12 md:py-24 lg:py-32 bg-accent">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold text-center mb-8">Shop by Category</h2>
            <div className="grid  grid-cols-2 md:grid-cols-4 gap-6">
              {categories.map((category, index) => (
                <div key={index} className="relative  group overflow-hidden rounded-lg">
                  <Image
                    src={category.image}
                    alt={category.name}
                    width={300}
                    height={300}
                    className="object-cover w-full h-48 transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/[40%]  flex items-center justify-center">
                    <h3 className="text-white text-xl font-semibold">{category.name}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        

        <section className="w-full flex flex-col justify-center items-center py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold text-center mb-8">Featured Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product, index) => (
                <div key={index} className="bg-card rounded-lg shadow-md overflow-hidden">
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={300}
                    height={300}
                    className="object-cover w-full h-48"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold mb-2">{product.name}</h3>
                    <p className="text-primary font-bold">₹{product.price}</p>
                    <Button className="w-full mt-4">Add to Cart</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="w-full flex flex-col justify-center items-center py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6 text-center">
            <h2 className="text-3xl font-bold mb-8">What Our Customers Say</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[1, 2, 3].map((_, index) => (
                <div key={index} className="bg-card p-6 rounded-lg shadow-md">
                  <div className="flex justify-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="mb-4">"The quality and craftsmanship of these lac bangles are exceptional. They add the perfect touch of elegance to any outfit."</p>
                  <p className="font-semibold">- Happy Customer</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-primary text-primary-foreground">
          <div className="container px-4 md:px-6 text-center">
            <h2 className="text-3xl font-bold mb-4">Join Our Community</h2>
            <p className="mb-8 text-lg">Subscribe to our newsletter for exclusive offers and updates</p>
            <form className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Input className="max-w-sm" placeholder="Enter your email" type="email" />
              <Button variant="secondary">Subscribe</Button>
            </form>
          </div>
        </section>
      </main>
      <footer className="bg-muted py-6">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold mb-4">Shop</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="hover:text-primary">New Arrivals</Link></li>
                <li><Link href="#" className="hover:text-primary">Best Sellers</Link></li>
                <li><Link href="#" className="hover:text-primary">Sale</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">About</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="hover:text-primary">Our Story</Link></li>
                <li><Link href="#" className="hover:text-primary">Artisans</Link></li>
                <li><Link href="#" className="hover:text-primary">Sustainability</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Customer Care</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="hover:text-primary">Contact Us</Link></li>
                <li><Link href="#" className="hover:text-primary">FAQs</Link></li>
                <li><Link href="#" className="hover:text-primary">Shipping & Returns</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Connect</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="hover:text-primary">Facebook</Link></li>
                <li><Link href="#" className="hover:text-primary">Instagram</Link></li>
                <li><Link href="#" className="hover:text-primary">Pinterest</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">© 2024 Qusamba. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}