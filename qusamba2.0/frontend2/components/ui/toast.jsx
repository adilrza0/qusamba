"use client"
import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const ToastContext = React.createContext({})

export function ToastProvider({ children }) {
  const [toasts, setToasts] = React.useState([])

  const toast = React.useCallback(({ title, description, variant = "default" }) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, title, description, variant }])
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id))
    }, 5000)
  }, [])

  const dismissToast = React.useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-0 right-0 z-50 flex flex-col gap-2 p-4">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            title={toast.title}
            description={toast.description}
            variant={toast.variant}
            onDismiss={() => dismissToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within ToastProvider")
  }
  return context
}

function Toast({ title, description, variant = "default", onDismiss }) {
  return (
    <div
      className={cn(
        "relative w-80 rounded-lg border p-4 shadow-lg",
        {
          "bg-background text-foreground": variant === "default",
          "bg-destructive text-destructive-foreground": variant === "destructive",
        }
      )}
    >
      <div className="flex gap-3">
        <div className="flex-1">
          {title && <div className="text-sm font-semibold">{title}</div>}
          {description && <div className="text-sm opacity-90">{description}</div>}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 p-0 opacity-70 hover:opacity-100"
          onClick={onDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
