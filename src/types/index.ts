export type UserRole = 'customer' | 'admin'

export interface Profile {
  id: string
  full_name: string | null
  role: UserRole
  created_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  created_at: string
}

export interface Product {
  id: string
  name: string
  description: string | null
  price: number
  category_id: string
  category?: Category
  images: string[]
  stock: number
  active: boolean
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  user_id: string
  status: 'pending' | 'paid' | 'cancelled'
  total: number
  stripe_pi_id: string | null
  created_at: string
  order_items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  product?: Product
  quantity: number
  unit_price: number
}

export interface CartItem {
  product_id: string
  name: string
  price: number
  image: string | null
  quantity: number
}