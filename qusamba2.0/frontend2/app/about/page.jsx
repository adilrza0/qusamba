import Link from "next/link"
import Image from "next/image"
import { Heart, ShoppingBag, Award, Users, Truck, Shield } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function AboutPage() {
  return (
    (<div className="flex flex-col min-h-screen">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/40">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1
                    className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">About Qusamba</h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Crafting beautiful bangles with passion, tradition, and modern elegance since 2015.
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <Image
                  src="/placeholder.svg?height=400&width=600"
                  alt="Qusamba artisan crafting bangles"
                  width={600}
                  height={400}
                  className="rounded-lg object-cover" />
              </div>
            </div>
          </div>
        </section>

        {/* Our Story */}
        <section className="w-full py-12 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Our Story</h2>
              <p className="text-muted-foreground md:text-lg leading-relaxed">
                Qusamba was born from a passion for preserving traditional jewelry-making techniques while embracing
                contemporary design. Founded in 2015 by master artisan Maria Qusamba, our brand represents the perfect
                fusion of heritage craftsmanship and modern aesthetics.
              </p>
              <p className="text-muted-foreground md:text-lg leading-relaxed">
                Each bangle in our collection tells a story - from the careful selection of materials to the intricate
                hand-finishing that makes every piece unique. We believe that jewelry should not just be an accessory,
                but a reflection of your personality and a celebration of life's precious moments.
              </p>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="w-full py-12 md:py-24 bg-muted/40">
          <div className="container px-4 md:px-6">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Our Values</h2>
              <p
                className="max-w-[700px] mx-auto text-muted-foreground md:text-xl/relaxed">
                The principles that guide everything we do at Qusamba.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="text-center">
                <CardContent className="p-6">
                  <Award className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <h3 className="text-lg font-semibold mb-2">Quality Craftsmanship</h3>
                  <p className="text-sm text-muted-foreground">
                    Every bangle is meticulously crafted by skilled artisans with attention to the finest details.
                  </p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-6">
                  <Users className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <h3 className="text-lg font-semibold mb-2">Customer First</h3>
                  <p className="text-sm text-muted-foreground">
                    Your satisfaction is our priority. We're committed to providing exceptional service and support.
                  </p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-6">
                  <Truck className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <h3 className="text-lg font-semibold mb-2">Sustainable Practices</h3>
                  <p className="text-sm text-muted-foreground">
                    We source materials responsibly and use eco-friendly packaging for all our products.
                  </p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-6">
                  <Shield className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <h3 className="text-lg font-semibold mb-2">Lifetime Guarantee</h3>
                  <p className="text-sm text-muted-foreground">
                    We stand behind our products with a comprehensive warranty and repair service.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="w-full py-12 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Meet Our Team</h2>
              <p
                className="max-w-[700px] mx-auto text-muted-foreground md:text-xl/relaxed">
                The talented individuals behind every Qusamba creation.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <Image
                  src="/placeholder.svg?height=200&width=200"
                  alt="Maria Qusamba"
                  width={200}
                  height={200}
                  className="rounded-full mx-auto mb-4" />
                <h3 className="text-xl font-semibold">Maria Qusamba</h3>
                <p className="text-muted-foreground mb-2">Founder & Master Artisan</p>
                <p className="text-sm text-muted-foreground">
                  With over 20 years of experience in jewelry making, Maria brings traditional techniques to modern
                  designs.
                </p>
              </div>
              <div className="text-center">
                <Image
                  src="/placeholder.svg?height=200&width=200"
                  alt="David Chen"
                  width={200}
                  height={200}
                  className="rounded-full mx-auto mb-4" />
                <h3 className="text-xl font-semibold">David Chen</h3>
                <p className="text-muted-foreground mb-2">Head of Design</p>
                <p className="text-sm text-muted-foreground">
                  David's innovative designs blend contemporary aesthetics with timeless elegance.
                </p>
              </div>
              <div className="text-center">
                <Image
                  src="/placeholder.svg?height=200&width=200"
                  alt="Sarah Williams"
                  width={200}
                  height={200}
                  className="rounded-full mx-auto mb-4" />
                <h3 className="text-xl font-semibold">Sarah Williams</h3>
                <p className="text-muted-foreground mb-2">Quality Assurance Manager</p>
                <p className="text-sm text-muted-foreground">
                  Sarah ensures every piece meets our exacting standards before reaching our customers.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="w-full py-12 md:py-24 bg-muted/40">
          <div className="container px-4 md:px-6">
            <div className="text-center space-y-6">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Ready to Find Your Perfect Bangle?</h2>
              <p className="max-w-[600px] mx-auto text-muted-foreground md:text-xl">
                Explore our collection and discover the piece that speaks to you.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/products">
                  <Button size="lg">Shop Collection</Button>
                </Link>
                <Link href="/contact">
                  <Button variant="outline" size="lg">
                    Contact Us
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      
    </div>)
  );
}
