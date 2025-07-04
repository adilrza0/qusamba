'use client'
import React from 'react'
import Image from 'next/image'
import { Heart, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UserMenu } from "@/components/user-menu"
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CartProvider } from '@/contexts/cart-context'

export default function Navbar() {
    const pathname = usePathname()
   
  return (
    
   <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <Link className="flex items-center justify-center" href="#">
             {/* <Image
               src="/placeholder.svg?height=40&width=40"
               width={40}
               height={40}
               alt="Qusamba Logo"
               className="rounded-full"
             /> */}
             <span className="ml-2 text-2xl great-vibes font-bold text-primary">Qusamba</span>
           </Link>
          <nav className="hidden md:flex gap-6">
            <Link
              href="/"
              className={`text-sm font-medium hover:text-primary hover:underline ${pathname=="/"&& "underline text-primary"} underline-offset-4`}>
              Home
            </Link>
            <Link
              href="/products"
              className={`text-sm font-medium  hover:text-primary hover:underline ${pathname=="/products"&& "underline text-primary"} underline-offset-4`}>
              Shop
            </Link>
            <Link
              href="/about"
              className={`text-sm font-medium hover:text-primary hover:underline ${pathname=="/about"&& "underline text-primary"} underline-offset-4`}>
              About
            </Link>
            <Link
              href="/contact"
              className={`text-sm font-medium hover:text-primary hover:underline ${pathname=="/contact"&& "underline text-primary"} underline-offset-4`}>
              Contact
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/wishlist">
              <Button variant="ghost" size="icon" aria-label="Wishlist">
                <Heart className={`h-5 w-5 "outline-none"  ${pathname=="/wishlist" && "fill-primary text-primary"} `} />
                <span className={"sr-only"}>Wishlist</span>
              </Button>
            </Link>
            <Link href="/cart">
              <Button variant="ghost" size="icon" aria-label="Cart">
                <ShoppingBag className={`h-5 w-5 "outline-none"  ${pathname=="/cart"&& "text-primary "}`} />
                <span className="sr-only">Cart</span>
              </Button>
            </Link>
            <CartProvider> <UserMenu /></CartProvider>
           
          </div>
        </div>
      </header>
  )
}
