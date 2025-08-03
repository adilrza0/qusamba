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

export function Carousel() {
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
              <Link href={"/products"}>
              <Button size="lg" className="bg-primary hover:bg-primary-dark text-white">
                Shop Now
              </Button>
              </Link>
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
