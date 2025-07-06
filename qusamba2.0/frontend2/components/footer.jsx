import Image from 'next/image'
import Link from 'next/link'
import React from 'react'



export default function Footer() {
  return (
    <footer className="border-t py-6 md:py-10">
        <div
          className="container flex flex-col items-center justify-center gap-4 px-4 md:px-6 text-center">
          {/* <Image
            src="/logo.png"
            alt="Qusamba Logo"
            width={100}
            height={32}
            className="mb-2" /> */}
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
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Qusamba. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="#" className="text-sm text-muted-foreground hover:underline">
              Privacy Policy
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:underline">
              Terms of Service
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:underline">
              Contact
            </Link>
          </div>
        </div>
      </footer>
  )
}
