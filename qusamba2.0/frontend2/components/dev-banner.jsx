"use client"

import { useState, useEffect } from "react"
import { AlertTriangle, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export function DevBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    // Only show in development mode
    if (process.env.NODE_ENV === 'development') {
      // Check if banner was previously dismissed
      const dismissed = localStorage.getItem('dev-banner-dismissed')
      if (!dismissed) {
        setIsVisible(true)
      }
    }
  }, [])

  const handleDismiss = () => {
    setIsVisible(false)
    setIsDismissed(true)
    localStorage.setItem('dev-banner-dismissed', 'true')
  }

  if (!isVisible || isDismissed) {
    return null
  }

  return (
    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 px-4 py-3 relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2" />
          <div>
            <p className="font-medium">Development Mode</p>
            <p className="text-sm">
              Backend not detected. Using sample data for demonstration. 
              <span className="font-medium"> Start your backend server for full functionality.</span>
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDismiss}
          className="text-yellow-700 hover:text-yellow-900 hover:bg-yellow-200"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
