"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

export function AdminAuthGuard({ children }) {
  const { state } = useAuth()
  const { user, isLoading } = state
  const router = useRouter()
  

  useEffect(() => {
    // Don't redirect while loading
    if (isLoading) return

    // If not authenticated, redirect to login
    if (!user) {
      console.log(user)
      router.push("/login?redirect=/admin")
      return
    }

    // If authenticated but not admin, redirect to home
    if (user.role !== "admin") {
      router.push("/")
      return
    }
  }, [user, isLoading, router])

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  // Don't render anything if not authenticated or not admin
  if (!user || user.role !== "admin") {
    return null
  }

  // Render the protected content
  return children
}
