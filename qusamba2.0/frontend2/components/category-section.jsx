"use client"

import Image from 'next/image'
import Link from 'next/link'
import React, { useState, useEffect } from 'react'
import { productsAPI } from '@/services/api'

export default function CategorySection() {
  const [types, setTypes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        setLoading(true)
        const response = await productsAPI.getProductTypes()
        setTypes(response || [])
      } catch (error) {
        console.error("Error fetching types:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchTypes()
  }, [])

  if (loading) return null
  if (types.length === 0) return null

  return (
    <section className="w-full flex flex-col justify-center items-center py-12 md:py-24 lg:py-32 bg-accent">
      <div className="container px-4 md:px-6">
        <h2 className="text-3xl font-bold text-center mb-8">Shop by Material</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {types.slice(0, 8).map((type) => (
            <Link
              key={type.name}
              href={`/products?type=${encodeURIComponent(type.name)}`}
              className="relative group overflow-hidden rounded-lg block"
            >
              <Image
                src={type.image || '/traditional.webp'}
                alt={type.name}
                width={300}
                height={300}
                className="object-cover w-full h-48 transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/[40%] flex items-center justify-center transition-colors group-hover:bg-black/50">
                <h3 className="text-white text-xl font-semibold capitalize">{type.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
