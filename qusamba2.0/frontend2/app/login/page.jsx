"use client";
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const { state, login } = useAuth()
  const router = useRouter()

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    setError("") // Clear error when user starts typing
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields")
      return
    }

    const success = await login(formData.email, formData.password)
    
    if (success) {
      router.push("/") // Redirect to home page after successful login
    } else {
      setError("Invalid email or password")
    }
  }

  const fillDemoCredentials = (type) => {
    if (type === "admin") {
      setFormData({
        email: "admin@qusamba.com",
        password: "admin123",
      })
    } else {
      setFormData({
        email: "customer@example.com",
        password: "customer123",
      })
    }
    setError("")
  }

  return (
    (<div className="flex flex-col min-h-screen">
      <main className="flex-1 flex items-center justify-center py-12">
        <div className="w-full max-w-md space-y-6">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Welcome Back</CardTitle>
              <CardDescription>Sign in to your Qusamba account</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your.email@example.com"
                    required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter your password"
                      required />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                    </Button>
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full" disabled={state.isLoading}>
                  {state.isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Demo Accounts</span>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fillDemoCredentials("customer")}
                    className="text-xs">
                    Customer Demo
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fillDemoCredentials("admin")}
                    className="text-xs">
                    Admin Demo
                  </Button>
                </div>
              </div>

              <div className="mt-6 text-center text-sm">
                <span className="text-muted-foreground">Don't have an account? </span>
                <Link
                  href="/signup"
                  className="underline underline-offset-4 hover:text-primary">
                  Sign up
                </Link>
              </div>
              <div className="mt-2 text-center text-sm">
                <Link
                  href="/forgot-password"
                  className="text-muted-foreground underline underline-offset-4 hover:text-primary">
                  Forgot your password?
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
    </div>)
  );
}
