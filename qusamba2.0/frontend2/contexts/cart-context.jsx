"use client";
import { createContext, useContext, useReducer, useEffect, useState } from "react"
import { cartAPI } from '../services/api'
import { useAuth } from './auth-context'

const CartContext = createContext(null)

function cartReducer(state, action) {
  switch (action.type) {
    case "ADD_ITEM": {
      const existingItem = state.items.find((item) =>
        item.id === action.payload.id && item.color === action.payload.color && item.size === action.payload.size)

      let newItems
      if (existingItem) {
        newItems = state.items.map((item) =>
          item.id === existingItem.id && item.color === existingItem.color && item.size === existingItem.size
            ? { ...item, quantity: item.quantity + 1 }
            : item)
      } else {
        newItems = [...state.items, { ...action.payload, quantity: 1 }]
      }

      const total = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0)

      return { items: newItems, total, itemCount }
    }

    case "REMOVE_ITEM": {
      
      const { id, color, size } = action.payload
      const newItems = state.items.filter((item) => {
        if (typeof action.payload === 'string') {
          // Backward compatibility - remove by id only
          return item.id !== action.payload
        }
        // Remove specific variant
        return !(item.id === id && item.color === color && item.size === size)
      })
      const total = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0)

      return { items: newItems, total, itemCount }
    }

    case "UPDATE_QUANTITY": {
      const { id, color, size, quantity } = action.payload
      
      if (quantity <= 0) {
        return cartReducer(state, { 
          type: "REMOVE_ITEM", 
          payload: { id, color, size }
        });
      }

      const newItems = state.items.map((item) => {
        if (color && size) {
          // Update specific variant
          return item.id === id && item.color === color && item.size === size 
            ? { ...item, quantity } 
            : item
        } else {
          // Backward compatibility - update by id only
          return item.id === id ? { ...item, quantity } : item
        }
      })
      const total = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0)

      return { items: newItems, total, itemCount }
    }

    case "CLEAR_CART":
      return { items: [], total: 0, itemCount: 0 }

    case "LOAD_CART": {
      const total = action.payload.reduce((sum, item) => sum + item.price * item.quantity, 0)
      const itemCount = action.payload.reduce((sum, item) => sum + item.quantity, 0)
      return { items: action.payload, total, itemCount }
    }

    default:
      return state
  }
}

export function CartProvider({
  children
}) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    total: 0,
    itemCount: 0,
  })
  
  // Safely get auth state to avoid SSR issues
  let authState;
  try {
    authState = useAuth().state;
  } catch (error) {
    // Fallback for SSR or when auth context is not available
    authState = { isAuthenticated: false };
  }
  const [isLoading, setIsLoading] = useState(false)

  // Helper function to sync with backend
  const syncWithBackend = async () => {
    if (!authState.isAuthenticated) {
      // Load from localStorage if not authenticated
      // const savedCart = localStorage.getItem("qusamba-cart")
      // if (savedCart) {
      //   try {
      //     const cartItems = JSON.parse(savedCart)
      //     dispatch({ type: "LOAD_CART", payload: cartItems })
      //   } catch (error) {
      //     console.error("Error loading cart from localStorage:", error)
      //   }
      // }
      return
    }

    try {
      setIsLoading(true)
      const response = await cartAPI.get()
      if (response.success) {
        // Transform backend cart format to frontend format
        const transformedItems = response.data.cart.map(item => ({
          id: item.product._id,
          name: item.product.name,
          price: item.product.price,
          images: item.product.images,
          color: item.color,
          size: item.size,
          quantity: item.quantity,
          slug: item.product.slug,
          stock: item.product.stock
        }))
        
        dispatch({ type: "LOAD_CART", payload: transformedItems })
        
        // Also save to localStorage as backup
        // localStorage.setItem("qusamba-cart", JSON.stringify(transformedItems))
      }
    } catch (error) {
      console.error("Error syncing cart with backend:", error)
      // Fallback to localStorage
      // const savedCart = localStorage.getItem("qusamba-cart")
      // if (savedCart) {
      //   try {
      //     const cartItems = JSON.parse(savedCart)
      //     dispatch({ type: "LOAD_CART", payload: cartItems })
      //   } catch (err) {
      //     console.error("Error loading cart from localStorage:", err)
      //   }
      // }
    } finally {
      setIsLoading(false)
    }
  }

  // Load cart when component mounts or authentication changes
  useEffect(() => {
    syncWithBackend()
  }, [authState.isAuthenticated])

  // Save to localStorage whenever cart changes (for offline fallback)
  // useEffect(() => {
  //   localStorage.setItem("qusamba-cart", JSON.stringify(state.items))
  // }, [state.items])

  // Enhanced cart actions that sync with backend
  const addItem = async (product, color = null, size = null) => {
    if (authState.isAuthenticated) {
      try {
        const response = await cartAPI.add(product.id, 1, color, size)
        if (response.success) {
          await syncWithBackend() // Refresh cart from backend
          return true
        }
      } catch (error) {
        console.error("Error adding item to cart:", error)
        // Fallback to local storage
      }
    }
    
    // Fallback or offline mode
    dispatch({ 
      type: "ADD_ITEM", 
      payload: { 
        id: product.id,
        name: product.name,
        price: product.price,
        images: product.images,
        color,
        size
      } 
    })
    return true
  }

  const removeItem = async (id, color = null, size = null) => {
    console.log('Removing item from cart:', { id, color, size });
    if (authState.isAuthenticated) {
      try {
        const response = await cartAPI.remove(id, color, size)
        if (response.success) {
          await syncWithBackend() // Refresh cart from backend
          return true
        }
      } catch (error) {
        console.error("Error removing item from cart:", error)
        // Fallback to local storage
      }
    }
    
    // Fallback or offline mode
    dispatch({ type: "REMOVE_ITEM", payload: { id, color, size } })
    return true
  }

  const updateQuantity = async (id, quantity, color = null, size = null) => {
    if (authState.isAuthenticated) {
      try {
        const response = await cartAPI.update(id, quantity, color, size)
        if (response.success) {
          await syncWithBackend() // Refresh cart from backend
          return true
        }
      } catch (error) {
        console.error("Error updating cart item:", error)
        // Fallback to local storage
      }
    }
    
    // Fallback or offline mode
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity, color, size } })
    return true
  }

  const clearCart = async () => {
    if (authState.isAuthenticated) {
      try {
        const response = await cartAPI.clear()
        if (response.success) {
          await syncWithBackend() // Refresh cart from backend
          return true
        }
      } catch (error) {
        console.error("Error clearing cart:", error)
        // Fallback to local storage
      }
    }
    
    // Fallback or offline mode
    dispatch({ type: "CLEAR_CART" })
    return true
  }

  return (
    <CartContext.Provider 
      value={{ 
        state: { ...state, isLoading }, 
        dispatch, 
        addItem, 
        removeItem, 
        updateQuantity, 
        clearCart,
        syncWithBackend 
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
