"use client";
import { createContext, useContext, useReducer, useEffect } from "react"

const AuthContext = createContext(null)

// Backend API URL - adjust this to match your backend server
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

function authReducer(state, action) {
  switch (action.type) {
    case "LOGIN_START":
    case "SIGNUP_START":
      return { ...state, isLoading: true, error: null }

    case "LOGIN_SUCCESS":
      
      return {
        user: action.payload.user,
        isLoading: false,
        isAuthenticated: true,
        error: null,
      }
    case "SIGNUP_SUCCESS":
      return {
        user: action.payload.user,
        isLoading: false,
        isAuthenticated: true,
        error: null,
      }

    case "LOGIN_FAILURE":
    case "SIGNUP_FAILURE":
      return {
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: action.payload,
      }

    case "LOGOUT":
      return {
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: null,
      }

    case "LOAD_USER":
      return {
        user: action.payload,
        isLoading: false,
        isAuthenticated: !!action.payload,
        error: null,
      }

    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      }

    default:
      return state
  }
}

// Helper function to make API calls
const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem("qusamba-token")
  
  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || "An error occurred")
  }

  return data
}

export function AuthProvider({
  children
}) {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isLoading: true,
    isAuthenticated: false,
  })

  // Verify token and load user on mount
  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("qusamba-token")
      
      if (!token) {
        dispatch({ type: "LOAD_USER", payload: null })
        return
      }

      try {
        const response = await apiCall('/auth/me')
        dispatch({ type: "LOAD_USER", payload: response.data.user })
      } catch (error) {
        console.error("Token verification failed:", error)
        // Token is invalid, clear it
        localStorage.removeItem("qusamba-token")
        localStorage.removeItem("qusamba-user")
        dispatch({ type: "LOAD_USER", payload: null })
      }
    }

    verifyToken()
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

    try {
      const response = await apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })

      // Backend returns { success: true, token: "...", data: { user: {...} } }
      const { token, data } = response
      
      const user = data.user
      
      
      localStorage.setItem('qusamba-token', token)
      dispatch({ type: "LOGIN_SUCCESS", payload: { user } })
      return true
    } catch (error) {
      dispatch({ type: "LOGIN_FAILURE", payload: error.message })
      return false
    }
  }

  const signup = async (email, password, firstName, lastName) => {
    dispatch({ type: "SIGNUP_START" })

    try {
      const response = await apiCall('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, firstName, lastName }),
      })

      // Backend returns { success: true, token: "...", data: { user: {...} } }
      const { token, data } = response
      const user = data.user
      
      localStorage.setItem('qusamba-token', token)
      dispatch({ type: "SIGNUP_SUCCESS", payload: { user } })
      return true
    } catch (error) {
      dispatch({ type: "SIGNUP_FAILURE", payload: error.message })
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem('qusamba-token')
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
