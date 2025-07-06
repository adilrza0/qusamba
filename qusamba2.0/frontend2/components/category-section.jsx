import Image from 'next/image'
import React from 'react'


export default function CategorySection() {

    const categories = [
  { name: "Traditional", image: '/traditional.webp' },
  { name: "Modern", image: '/bn7105.webp' },
  { name: "Bridal", image: '/bn5868.webp' },
  { name: "Festive", image: '/festive.webp' },
]
  return (
    <section className="w-full flex flex-col justify-center items-center py-12 md:py-24 lg:py-32 bg-accent">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold text-center mb-8">Shop by Category</h2>
            <div className="grid  grid-cols-2 md:grid-cols-4 gap-6">
              {categories.map((category, index) => (
                <div key={index} className="relative  group overflow-hidden rounded-lg">
                  <Image
                    src={category.image}
                    alt={category.name}
                    width={300}
                    height={300}
                    className="object-cover w-full h-48 transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/[40%]  flex items-center justify-center">
                    <h3 className="text-white text-xl font-semibold">{category.name}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        

  )
}
