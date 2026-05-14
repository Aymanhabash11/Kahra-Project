import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { CartItem } from '../lib/types'
import { useAuth } from './AuthContext'

interface CartContextValue {
  items: CartItem[]
  cartOpen: boolean
  setCartOpen: (open: boolean) => void
  addItem: (item: Omit<CartItem, 'id'>) => Promise<void>
  removeItem: (id: string) => Promise<void>
  updateQuantity: (id: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  itemCount: number
  total: number
}

const CartContext = createContext<CartContextValue | null>(null)

const LS_KEY = 'hons_cart'

function loadLocalCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? (JSON.parse(raw) as CartItem[]) : []
  } catch {
    return []
  }
}

function saveLocalCart(items: CartItem[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(items))
}

function makeId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [items, setItems] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)

  useEffect(() => {
    if (user) {
      // Load from Supabase, discard guest cart
      supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id)
        .then(({ data }) => {
          if (data) {
            setItems(data as CartItem[])
          }
        })
    } else {
      setItems(loadLocalCart())
    }
  }, [user])

  useEffect(() => {
    if (!user) saveLocalCart(items)
  }, [items, user])

  async function addItem(item: Omit<CartItem, 'id'>) {
    if (user) {
      const { data, error } = await supabase
        .from('cart_items')
        .upsert(
          {
            user_id: user.id,
            product_id: item.product_id,
            product_title: item.product_title,
            product_image: item.product_image,
            product_price: item.product_price,
            product_vendor: item.product_vendor,
            quantity: item.quantity,
            size: item.size,
            color: item.color,
          },
          { onConflict: 'user_id,product_id,size,color' },
        )
        .select()
        .single()

      if (error) {
        console.error('Cart upsert failed:', error)
      } else if (data) {
        setItems(prev => {
          const idx = prev.findIndex(
            i => i.product_id === item.product_id && i.size === item.size && i.color === item.color,
          )
          if (idx >= 0) {
            const updated = [...prev]
            updated[idx] = data as CartItem
            return updated
          }
          return [...prev, data as CartItem]
        })
      }
    } else {
      setItems(prev => {
        const idx = prev.findIndex(
          i => i.product_id === item.product_id && i.size === item.size && i.color === item.color,
        )
        if (idx >= 0) {
          const updated = [...prev]
          updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + item.quantity }
          return updated
        }
        return [...prev, { ...item, id: makeId() }]
      })
    }
    setCartOpen(true)
  }

  async function removeItem(id: string) {
    if (user) {
      await supabase.from('cart_items').delete().eq('id', id).eq('user_id', user.id)
    }
    setItems(prev => prev.filter(i => i.id !== id))
  }

  async function updateQuantity(id: string, quantity: number) {
    if (quantity <= 0) { removeItem(id); return }
    if (user) {
      await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', id)
        .eq('user_id', user.id)
    }
    setItems(prev => prev.map(i => i.id === id ? { ...i, quantity } : i))
  }

  async function clearCart() {
    if (user) {
      await supabase.from('cart_items').delete().eq('user_id', user.id)
    }
    setItems([])
    localStorage.removeItem(LS_KEY)
  }

  const itemCount = items.reduce((s, i) => s + i.quantity, 0)
  const total = items.reduce((s, i) => s + i.product_price * i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, cartOpen, setCartOpen, addItem, removeItem, updateQuantity, clearCart, itemCount, total }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
