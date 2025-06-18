import {  ShoppingCart } from "lucide-react"
import { Button } from "../ui/button"
import Link from "next/link"




export default function Navbar() {
  return (
   <header className="px-4 lg:px-6 h-16 flex items-center border-b border-border">
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
           <nav className="ml-auto flex gap-4 sm:gap-6">
             <Link className="text-sm font-medium hover:text-primary" href="/">
               Home
             </Link>
             <Link className="text-sm font-medium hover:text-primary" href="/shop">
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
  )
}
