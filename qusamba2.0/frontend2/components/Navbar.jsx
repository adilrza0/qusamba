'use client'
import React, { useState } from 'react'
import Image from 'next/image'
import { Heart, ShoppingBag, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UserMenu } from "@/components/user-menu"
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CartProvider } from '@/contexts/cart-context'

export default function Navbar() {
    const pathname = usePathname()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    
    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen)
    }
   
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
            <Link href="/wishlist" className="hidden sm:block">
              <Button variant="ghost" size="icon" aria-label="Wishlist">
                <Heart className={`h-5 w-5 "outline-none"  ${pathname=="/wishlist" && "fill-primary text-primary"} `} />
                <span className={"sr-only"}>Wishlist</span>
              </Button>
            </Link>
            <Link href="/cart" className="hidden sm:block">
              <Button variant="ghost" size="icon" aria-label="Cart">
                <ShoppingBag className={`h-5 w-5 "outline-none"  ${pathname=="/cart"&&"text-primary "}`} />
                <span className="sr-only">Cart</span>
              </Button>
            </Link>
            <div className="hidden sm:block">
              <CartProvider><UserMenu /></CartProvider>
            </div>
            
            {/* Mobile menu button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={toggleMobileMenu}
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
        
        {/* Mobile menu overlay */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-white">
            <div className="flex flex-col h-full">
              {/* Mobile header */}
              <div className="flex items-center justify-between p-4 border-b">
                <Link href="/" className="text-2xl font-bold text-primary">
                  Qusamba
                </Link>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={toggleMobileMenu}
                  aria-label="Close mobile menu"
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>
              
              {/* Mobile navigation */}
              <div className="flex-1 overflow-y-auto">
                <nav className="flex flex-col p-4 space-y-4">
                  <Link
                    href="/"
                    className={`text-lg font-medium hover:text-primary py-2 ${pathname=="/" && "text-primary"}`}
                    onClick={toggleMobileMenu}
                  >
                    Home
                  </Link>
                  <Link
                    href="/products"
                    className={`text-lg font-medium hover:text-primary py-2 ${pathname=="/shop" && "text-primary"}`}
                    onClick={toggleMobileMenu}
                  >
                    Shop
                  </Link>
                  <Link
                    href="/categories"
                    className={`text-lg font-medium hover:text-primary py-2 ${pathname=="/categories" && "text-primary"}`}
                    onClick={toggleMobileMenu}
                  >
                    Categories
                  </Link>
                  <Link
                    href="/about"
                    className={`text-lg font-medium hover:text-primary py-2 ${pathname=="/about" && "text-primary"}`}
                    onClick={toggleMobileMenu}
                  >
                    About
                  </Link>
                  <Link
                    href="/contact"
                    className={`text-lg font-medium hover:text-primary py-2 ${pathname=="/contact" && "text-primary"}`}
                    onClick={toggleMobileMenu}
                  >
                    Contact
                  </Link>
                  
                  <div className="border-t pt-4 mt-4">
                    <div className="flex items-center gap-4 mb-4">
                      <Link href="/wishlist" onClick={toggleMobileMenu}>
                        <Button variant="ghost" size="icon" aria-label="Wishlist">
                          <Heart className={`h-5 w-5 ${pathname=="/wishlist" && "fill-primary text-primary"}`} />
                          <span className="sr-only">Wishlist</span>
                        </Button>
                      </Link>
                      <Link href="/cart" onClick={toggleMobileMenu}>
                        <Button variant="ghost" size="icon" aria-label="Cart">
                          <ShoppingBag className={`h-5 w-5 ${pathname=="/cart" && "text-primary"}`} />
                          <span className="sr-only">Cart</span>
                        </Button>
                      </Link>
                    </div>
                    
                    {/* Mobile user menu */}
                    <div className="w-full">
                      <CartProvider><UserMenu mobile onClose={toggleMobileMenu} /></CartProvider>
                    </div>
                  </div>
                </nav>
              </div>
            </div>
          </div>
        )}
      </header>
  )
}
