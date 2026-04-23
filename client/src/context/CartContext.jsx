// src/context/CartContext.jsx

import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext()

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('inlocfix_cart')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // Persist cart to localStorage
  useEffect(() => {
    localStorage.setItem('inlocfix_cart', JSON.stringify(cartItems))
  }, [cartItems])

  const addToCart = (service, category) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === service.id)
      if (existing) {
        return prev.map((item) =>
          item.id === service.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [
        ...prev,
        {
          ...service,
          categoryId: category.id,
          categoryName: category.name,
          categoryIcon: category.icon,
          quantity: 1,
        },
      ]
    })
  }

  const removeFromCart = (serviceId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== serviceId))
  }

  const updateQuantity = (serviceId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(serviceId)
      return
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === serviceId ? { ...item, quantity } : item
      )
    )
  }

  const clearCart = () => {
    setCartItems([])
  }

  const getItemQuantity = (serviceId) => {
    const item = cartItems.find((i) => i.id === serviceId)
    return item ? item.quantity : 0
  }

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const cartTotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getItemQuantity,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
