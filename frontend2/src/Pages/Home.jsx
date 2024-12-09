import { useState, useEffect } from 'react'
import { ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react"



import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Link } from 'react-router-dom'
import { Img } from 'react-image'


const carouselItems = [
  {
    image: "/placeholder.svg?height=600&width=1200&text=Elegant+Lac+Bangles",
    title: "Elegant Lac Bangles",
    description: "Discover our exquisite collection of handcrafted lac bangles",
  },
  {
    image: "/placeholder.svg?height=600&width=1200&text=Traditional+Designs",
    title: "Traditional Designs",
    description: "Embrace the rich heritage of Indian craftsmanship",
  },
  {
    image: "/placeholder.svg?height=600&width=1200&text=Festive+Collection",
    title: "Festive Collection",
    description: "Add a touch of glamour to your celebrations",
  },
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
    <div className="relative w-full h-[400px] md:h-[600px]">
      {carouselItems.map((item, index) => (
        <div
          key={index}
          className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000 ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Img src={item.image} alt={item.title} layout="fill" objectFit="cover" />
          <div className="absolute inset-0 bg-black  flex items-center justify-center">
            <div className="text-center text-primary">
              <h2 className="text-4xl md:text-6xl font-bold mb-4">{item.title}</h2>
              <p className="text-xl md:text-2xl mb-8">{item.description}</p>
              <Button size="lg" className="bg-primary hover:bg-primary/70 text-white">
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

export default function Homepage() {
  
  
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 bg-background flex items-center">
        <Link className="flex items-center justify-center" href="#">
          <Img
            src="/placeholder.svg?height=40&width=40"
            width={40}
            height={40}
            alt="Lac Bangles Logo"
            className="rounded-full"
          />
          <span className="ml-2 text-2xl font-bold great-vibes-regular">Qusamba</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#">
            Home
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#">
            Shop
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#">
            About
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#">
            Contact
          </Link>
        </nav>
        <Button variant="ghost" size="icon" className="ml-4">
          <ShoppingCart className="h-6 w-6" />
          <span className="sr-only">Shopping Cart</span>
        </Button>
      </header>
      <main className="flex-1">
        <Carousel />
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <Img
                alt="Colorful Lac Bangles"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last lg:aspect-square"
                height={550}
                src="/placeholder.svg?height=550&width=550"
                width={550}
              />
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
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-8">Featured Products</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="relative group overflow-hidden rounded-lg">
                  <Img
                    alt={`Lac Bangle ${i}`}
                    className="object-cover w-full h-60"
                    height={300}
                    src={`/placeholder.svg?height=300&width=300&text=Lac+Bangle+${i}`}
                    width={300}
                  />
                  <div className="absolute inset-0 flex items-end justify-center p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button className="w-full">Add to Cart</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Stay Updated</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Subscribe to our newsletter for the latest designs and exclusive offers.
                </p>
              </div>
              <div className="w-full max-w-sm space-y-2">
                <form className="flex space-x-2">
                  <Input className="max-w-lg flex-1" placeholder="Enter your email" type="email" />
                  <Button type="submit">Subscribe</Button>
                </form>
              </div>
            </div>
          </div>
        </section>
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