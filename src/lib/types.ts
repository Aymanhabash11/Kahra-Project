export interface ProductVariant {
  size: string
  color: string
  quantity: number
}

export interface Product {
  id: string
  title: string
  handle: string
  description?: string
  price: number
  currency: string
  collection?: string
  designer_id?: string
  vendor?: string
  product_url?: string
  image_url: string
  all_images: string[]
  materials?: string
  care_instructions?: string
  sizes: string[]
  colors: string[]
  in_stock: boolean
  quantity?: number
  size_quantities?: Record<string, number>
  variants?: ProductVariant[]
  color_images?: Record<string, string>
  created_at?: string
}

export interface Designer {
  id: string
  name: string
  handle: string
  origin?: string
  bio?: string
  image_url?: string
  website?: string
  products?: Product[]
  created_at?: string
}

export interface JournalPost {
  id: string
  title: string
  slug: string
  excerpt?: string
  content?: string
  cover_image?: string
  category?: string
  author?: string
  published: boolean
  published_at?: string
  created_at?: string
}

export interface Profile {
  id: string
  email?: string
  full_name?: string
  phone?: string
  avatar_url?: string
  role: 'customer' | 'admin'
  created_at?: string
}

export interface CartItem {
  id: string
  product_id: string
  product_title: string
  product_image: string
  product_price: number
  product_vendor?: string
  quantity: number
  size: string
  color: string
}

export interface NewsletterSubscriber {
  id: string
  email: string
  name?: string
  created_at?: string
}

// JSON shape from products_collection.json
export interface JsonProduct {
  collection: string
  title: string
  handle: string
  vendor: string
  price: string | number
  product_url: string
  image_url: string
  all_images?: string[]
}

// JSON shape from designers_clean.json
export interface JsonDesigner {
  designer?: string
  name?: string
  handle?: string
  products: {
    title: string
    price: string | number
    image: string
    url: string
    handle?: string
  }[]
}
