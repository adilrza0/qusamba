

import Link from "next/link"
import Image from "next/image"
import { ShoppingBag, Heart } from "lucide-react"

import { Button } from "@/components/ui/button"
import { FeaturedProducts } from "@/components/featured-products"
import { HeroSection } from "@/components/hero-section"
import { TestimonialSection } from "@/components/testimonial-section"
import { useCart } from "@/contexts/cart-context"
import { UserMenu } from "@/components/user-menu"
import { Carousel } from "@/components/crousel"
import CategorySection from "@/components/category-section"

export default function Home() {
 
  return (
    (<div className="flex flex-col min-h-screen">
      
      <main className="flex-1">
        <Carousel/>
        <HeroSection />
        <CategorySection/>
        
        <FeaturedProducts />
        <TestimonialSection />
      </main>
    </div>)
  );
}
