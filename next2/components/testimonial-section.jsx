import Image from "next/image"
import { Star } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Fashion Blogger",
    content:
      "I absolutely love my Qusamba bangles! The quality is exceptional, and they add the perfect touch to any outfit. I get compliments every time I wear them.",
    avatar: "/placeholder.svg?height=40&width=40",
    rating: 5,
  },
  {
    name: "Emily Chen",
    role: "Jewelry Enthusiast",
    content:
      "These bangles are stunning and so comfortable to wear. The craftsmanship is beautiful, and the customer service was excellent. Highly recommend!",
    avatar: "/placeholder.svg?height=40&width=40",
    rating: 5,
  },
  {
    name: "Jessica Williams",
    role: "Regular Customer",
    content:
      "I've purchased several sets of bangles from Qusamba, and they never disappoint. The designs are unique, and the quality is consistent. My go-to for accessories!",
    avatar: "/placeholder.svg?height=40&width=40",
    rating: 4,
  },
]

export function TestimonialSection() {
  return (
    (<section className="w-full py-12 md:py-24 bg-muted/40">
      <div className="container px-4 md:px-6">
        <div
          className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">What Our Customers Say</h2>
            <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed">
              Don't just take our word for it. Here's what our customers have to say about Qusamba bangles.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <Image
                    src={testimonial.avatar || "/placeholder.svg"}
                    alt={testimonial.name}
                    width={40}
                    height={40}
                    className="rounded-full" />
                  <div>
                    <h3 className="font-semibold">{testimonial.name}</h3>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < testimonial.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                      }`} />
                  ))}
                </div>
                <p className="text-muted-foreground">{testimonial.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>)
  );
}
