import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem } from '@/types'

interface CartStore {
  items: CartItem[]
  _hasHydrated: boolean
  setHasHydrated: (state: boolean) => void
  addItem: (item: CartItem) => void
  removeItem: (product_id: string) => void
  updateQuantity: (product_id: string, quantity: number) => void
  clearCart: () => void
  totalItems: () => number
  totalPrice: () => number
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      _hasHydrated: false,

      setHasHydrated: (state) => set({ _hasHydrated: state }),

      addItem: (newItem) => {
        const items = get().items
        const existing = items.find((i) => i.product_id === newItem.product_id)

        if (existing) {
          set({
            items: items.map((i) =>
              i.product_id === newItem.product_id
                ? { ...i, quantity: i.quantity + newItem.quantity }
                : i
            ),
          })
        } else {
          set({ items: [...items, newItem] })
        }
      },

      removeItem: (product_id) => {
        set({ items: get().items.filter((i) => i.product_id !== product_id) })
      },

      updateQuantity: (product_id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(product_id)
          return
        }
        set({
          items: get().items.map((i) =>
            i.product_id === product_id ? { ...i, quantity } : i
          ),
        })
      },

      clearCart: () => set({ items: [] }),

      totalItems: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0),

      totalPrice: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    {
      name: 'cart-storage',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)