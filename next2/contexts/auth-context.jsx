"use client";
import { createContext, useContext, useReducer, useEffect } from "react"

const AuthContext = createContext(null)

function authReducer(state, action) {
  switch (action.type) {
    case "LOGIN_START":
    case "SIGNUP_START":
      return { ...state, isLoading: true }

    case "LOGIN_SUCCESS":
    case "SIGNUP_SUCCESS":
      return {
        user: action.payload,
        isLoading: false,
        isAuthenticated: true,
      }

    case "LOGIN_FAILURE":
    case "SIGNUP_FAILURE":
      return {
        user: null,
        isLoading: false,
        isAuthenticated: false,
      }

    case "LOGOUT":
      return {
        user: null,
        isLoading: false,
        isAuthenticated: false,
      }

    case "LOAD_USER":
      return {
        user: action.payload,
        isLoading: false,
        isAuthenticated: !!action.payload,
      }

    default:
      return state
  }
}

// Mock users database (in a real app, this would be a backend API)
const mockUsers = [
  {
    id: "1",
    email: "admin@qusamba.com",
    password: "admin123",
    firstName: "Admin",
    lastName: "User",
    role: "admin",
    createdAt: "2023-01-01T00:00:00Z",
  },
  {
    id: "2",
    email: "customer@example.com",
    password: "customer123",
    firstName: "John",
    lastName: "Doe",
    role: "customer",
    createdAt: "2023-01-02T00:00:00Z",
  },
]

export function AuthProvider({
  children
}) {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isLoading: true,
    isAuthenticated: false,
  })

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("qusamba-user")
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser)
        dispatch({ type: "LOAD_USER", payload: user })
      } catch (error) {
        console.error("Error loading user from localStorage:", error)
        dispatch({ type: "LOAD_USER", payload: null })
      }
    } else {
      dispatch({ type: "LOAD_USER", payload: null })
    }
  }, [])

  // Save user to localStorage whenever it changes
  useEffect(() => {
    if (state.user) {
      localStorage.setItem("qusamba-user", JSON.stringify(state.user))
    } else {
      localStorage.removeItem("qusamba-user")
    }
  }, [state.user])

  const login = async (email, password) => {
    dispatch({ type: "LOGIN_START" })

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const user = mockUsers.find((u) => u.email === email && u.password === password)

    if (user) {
      const { password: _, ...userWithoutPassword } = user
      dispatch({ type: "LOGIN_SUCCESS", payload: userWithoutPassword })
      return true
    } else {
      dispatch({ type: "LOGIN_FAILURE" })
      return false
    }
  }

  const signup = async (email, password, firstName, lastName) => {
    dispatch({ type: "SIGNUP_START" })

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Check if user already exists
    const existingUser = mockUsers.find((u) => u.email === email)
    if (existingUser) {
      dispatch({ type: "SIGNUP_FAILURE" })
      return false
    }

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      email,
      firstName,
      lastName,
      role: "customer",
      createdAt: new Date().toISOString(),
    }

    // Add to mock database
    mockUsers.push({ ...newUser, password })

    dispatch({ type: "SIGNUP_SUCCESS", payload: newUser })
    return true
  }

  const logout = () => {
    dispatch({ type: "LOGOUT" })
  }

  return <AuthContext.Provider value={{ state, dispatch, login, signup, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
