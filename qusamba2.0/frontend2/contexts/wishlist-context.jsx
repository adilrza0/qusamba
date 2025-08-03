"use client";
import { createContext, useContext, useReducer, useEffect, useState } from "react"
import { wishlistAPI } from '../services/api'
import { useAuth } from './auth-context'

const WishlistContext = createContext(null)

function wishlistReducer(state, action) {
  switch (action.type) {
    case "ADD_ITEM": {
      const exists = state.items.find(item => item.id === action.payload.id)
      if (exists) {
        return state // Item already in wishlist
      }
      
      const newItems = [...state.items, action.payload]
      return { items: newItems, itemCount: newItems.length }
    }

    case "REMOVE_ITEM": {
      const newItems = state.items.filter(item => item.id !== action.payload)
      return { items: newItems, itemCount: newItems.length }
    }

    case "CLEAR_WISHLIST":
      return { items: [], itemCount: 0 }

    case "LOAD_WISHLIST": {
      return { items: action.payload, itemCount: action.payload.length }
    }

    default:
      return state
  }
}

export function WishlistProvider({ children }) {
  const [state, dispatch] = useReducer(wishlistReducer, {
    items: [],
    itemCount: 0,
  })

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const savedWishlist = localStorage.getItem("qusamba-wishlist")
    if (savedWishlist) {
      try {
        const wishlistItems = JSON.parse(savedWishlist)
        dispatch({ type: "LOAD_WISHLIST", payload: wishlistItems })
      } catch (error) {
        console.error("Error loading wishlist from localStorage:", error)
      }
    }
  }, [])

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("qusamba-wishlist", JSON.stringify(state.items))
  }, [state.items])

  return (
    <WishlistContext.Provider value={{ state, dispatch }}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider")
  }
  return context
}
