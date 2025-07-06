"use client";
import { createContext, useContext, useReducer, useEffect } from "react"

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
      const newItems = state.items.filter((item) => item.id !== action.payload)
      const total = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0)

      return { items: newItems, total, itemCount }
    }

    case "UPDATE_QUANTITY": {
      if (action.payload.quantity <= 0) {
        return cartReducer(state, { type: "REMOVE_ITEM", payload: action.payload.id });
      }

      const newItems = state.items.map((item) =>
        item.id === action.payload.id ? { ...item, quantity: action.payload.quantity } : item)
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

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("qusamba-cart")
    if (savedCart) {
      try {
        const cartItems = JSON.parse(savedCart)
        dispatch({ type: "LOAD_CART", payload: cartItems })
      } catch (error) {
        console.error("Error loading cart from localStorage:", error)
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("qusamba-cart", JSON.stringify(state.items))
  }, [state.items])

  return <CartContext.Provider value={{ state, dispatch }}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
