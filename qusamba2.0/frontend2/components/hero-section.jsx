import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    (<section className="w-full py-12 md:py-24 lg:py-32 bg-muted/40">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-2  lg:gap-24 items-center">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1
                className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                Elegant Bangles for Every Occasion
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                Discover our handcrafted collection of beautiful bangles that add the perfect finishing touch to any
                outfit.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/products">
                <Button size="lg">Shop Collection</Button>
              </Link>
              <Link href="/about">
                <Button variant="outline" size="lg">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <Image
              src="/download.jpeg"
              alt="Elegant bangles collection"
              
              width={550}
              height={350}
              className="rounded-lg  w-[100vw] h-[30vw] object-cover "
              priority />
          </div>
        </div>
      </div>
    </section>)
  );
}
