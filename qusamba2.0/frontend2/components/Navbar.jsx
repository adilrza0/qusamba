"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Heart, ShoppingBag, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/user-menu";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/contexts/cart-context";
import { useWishlist } from "@/contexts/wishlist-context";
import { cn } from "@/lib/utils";
import { greatVibes } from "@/app/layout";

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { state: cartState } = useCart();
  const { state: wishlistState } = useWishlist();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link className="flex items-center justify-center" href="/">
            {/* <Image className="object-contain h-15 w-15"
               src={"/peacocklogo.png"}
               width={80} height={80}
               alt="Qusamba Logo"
                priority
             /> */}
            <span
              className={cn(
                "ml-2 text-4xl great-vibes font-bold text-primary",
                greatVibes.className
              )}
            >
              Qusamba
            </span>
          </Link>
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className={`text-foreground hover:text-primary transition-colors font-medium ${
                pathname == "/" && " text-primary"
              } `}
            >
              Home
            </Link>
            <Link
              href="/products"
              className={`text-foreground hover:text-primary transition-colors font-medium ${
                pathname == "/products" && " text-primary"
              } `}
            >
              {" "}
              Shop
            </Link>
            <Link
              href="/about"
              className={`text-foreground hover:text-primary transition-colors font-medium ${
                pathname == "/about" && " text-primary"
              } `}
            >
              About
            </Link>
            <Link
              href="/contact"
              className={`text-foreground hover:text-primary transition-colors font-medium ${
                pathname == "/contact" && " text-primary"
              } `}
            >
              Contact
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/wishlist" className="hidden sm:block">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Wishlist"
                className="relative"
              >
                <Heart
                  className={`h-5 w-5 "outline-none"  ${
                    pathname == "/wishlist" && "fill-primary text-primary"
                  } `}
                />
                {wishlistState.itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {wishlistState.itemCount}
                  </span>
                )}
                <span className={"sr-only"}>Wishlist</span>
              </Button>
            </Link>
            <Link href="/cart" className="hidden sm:block">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Cart"
                className="relative"
              >
                <ShoppingBag
                  className={`h-5 w-5 "outline-none"  ${
                    pathname == "/cart" && "text-primary "
                  }`}
                />
                {cartState.itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartState.itemCount}
                  </span>
                )}
                <span className="sr-only">Cart</span>
              </Button>
            </Link>
            <div className="hidden sm:block">
              <UserMenu />
            </div>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={toggleMobileMenu}
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[60px] z-50 bg-white">
          <div className="flex flex-col h-full">
            {/* Mobile header */}
            {/* <div className="flex items-center justify-between p-4 border-b">
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
            </div> */}

            {/* Mobile navigation */}
            <div className="flex-1 absolute z-80 bg-background/95 backdrop-blur-sm overflow-y-auto">
              <nav className="flex  flex-col p-4 space-y-4">
                <Link
                  href="/"
                  className={`text-lg font-medium hover:text-primary py-2 ${
                    pathname == "/" && "text-primary"
                  }`}
                  onClick={toggleMobileMenu}
                >
                  Home
                </Link>
                <Link
                  href="/products"
                  className={`text-lg font-medium hover:text-primary py-2 ${
                    pathname == "/shop" && "text-primary"
                  }`}
                  onClick={toggleMobileMenu}
                >
                  Shop
                </Link>
                <Link
                  href="/categories"
                  className={`text-lg font-medium hover:text-primary py-2 ${
                    pathname == "/categories" && "text-primary"
                  }`}
                  onClick={toggleMobileMenu}
                >
                  Categories
                </Link>
                <Link
                  href="/about"
                  className={`text-lg font-medium hover:text-primary py-2 ${
                    pathname == "/about" && "text-primary"
                  }`}
                  onClick={toggleMobileMenu}
                >
                  About
                </Link>
                <Link
                  href="/contact"
                  className={`text-lg font-medium hover:text-primary py-2 ${
                    pathname == "/contact" && "text-primary"
                  }`}
                  onClick={toggleMobileMenu}
                >
                  Contact
                </Link>

                <div className="border-t pt-4 mt-4">
                  <div className="flex items-center gap-4 mb-4">
                    <Link href="/wishlist" onClick={toggleMobileMenu}>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Wishlist"
                        className="relative"
                      >
                        <Heart
                          className={`h-5 w-5 ${
                            pathname == "/wishlist" &&
                            "fill-primary text-primary"
                          }`}
                        />
                        {wishlistState.itemCount > 0 && (
                          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {wishlistState.itemCount}
                          </span>
                        )}
                        <span className="sr-only">Wishlist</span>
                      </Button>
                    </Link>
                    <Link href="/cart" onClick={toggleMobileMenu}>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Cart"
                        className="relative"
                      >
                        <ShoppingBag
                          className={`h-5 w-5 ${
                            pathname == "/cart" && "text-primary"
                          }`}
                        />
                        {cartState.itemCount > 0 && (
                          <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {cartState.itemCount}
                          </span>
                        )}
                        <span className="sr-only">Cart</span>
                      </Button>
                    </Link>
                  </div>

                  {/* Mobile user menu */}
                  <div className="w-full">
                    <UserMenu mobile onClose={toggleMobileMenu} />
                  </div>
                </div>
              </nav>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
