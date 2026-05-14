import { supabase } from './supabase'
import type { Product, Designer, JsonProduct, JsonDesigner } from './types'

export function formatName(name: string): string {
  return name
    .replace(/-/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
}

export function normalize(str: string): string {
  if (!str) return ''
  return str
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ')
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function jsonProductToProduct(p: JsonProduct): Product {
  return {
    id: p.handle,
    title: p.title,
    handle: p.handle,
    price: typeof p.price === 'string' ? parseFloat(p.price) : p.price,
    currency: 'USD',
    collection: p.collection,
    vendor: p.vendor,
    product_url: p.product_url,
    image_url: p.image_url,
    all_images: p.all_images ?? [p.image_url],
    sizes: [],
    colors: [],
    in_stock: true,
  }
}

export async function loadProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  if (!error && data && data.length > 0) {
    return data as Product[]
  }

  // Fallback to JSON
  try {
    const res = await fetch('/products_collection.json')
    const json: JsonProduct[] = await res.json()
    return json.map(jsonProductToProduct)
  } catch {
    return []
  }
}

export async function loadDesigners(): Promise<Designer[]> {
  const { data, error } = await supabase
    .from('designers')
    .select('*')
    .order('name')

  if (!error && data && data.length > 0) {
    return data as Designer[]
  }

  // Fallback to JSON
  try {
    const res = await fetch('/designers_clean.json')
    const json: JsonDesigner[] = await res.json()
    return json.map(d => ({
      id: d.handle ?? slugify(d.designer ?? d.name ?? ''),
      name: d.designer ?? d.name ?? '',
      handle: d.handle ?? slugify(d.designer ?? d.name ?? ''),
      products: d.products.map(p => ({
        id: p.handle ?? slugify(p.title),
        title: p.title,
        handle: p.handle ?? slugify(p.title),
        price: typeof p.price === 'string' ? parseFloat(p.price) : p.price,
        currency: 'USD',
        image_url: p.image,
        all_images: [p.image],
        product_url: p.url,
        vendor: d.designer ?? d.name ?? '',
        sizes: [],
        colors: [],
        in_stock: true,
      })),
    }))
  } catch {
    return []
  }
}

export async function seedFromJson(): Promise<{ products: number; designers: number }> {
  let productCount = 0
  let designerCount = 0

  try {
    // Seed designers
    const dresp = await fetch('/designers_clean.json')
    const dJson: JsonDesigner[] = await dresp.json()

    for (const d of dJson) {
      const name = d.designer ?? d.name ?? ''
      if (!name) continue
      const handle = slugify(name)
      const image = d.products[0]?.image ?? ''

      const { error } = await supabase
        .from('designers')
        .upsert({ name, handle, image_url: image }, { onConflict: 'handle' })

      if (!error) designerCount++
    }

    // Seed products
    const presp = await fetch('/products_collection.json')
    const pJson: JsonProduct[] = await presp.json()

    const BATCH = 50
    for (let i = 0; i < pJson.length; i += BATCH) {
      const batch = pJson.slice(i, i + BATCH).map(p => ({
        title: p.title,
        handle: p.handle,
        price: typeof p.price === 'string' ? parseFloat(p.price) : p.price,
        currency: 'USD',
        collection: p.collection,
        vendor: p.vendor,
        product_url: p.product_url,
        image_url: p.image_url,
        all_images: p.all_images ?? [p.image_url],
        in_stock: true,
        sizes: [],
        colors: [],
      }))

      const { error } = await supabase
        .from('products')
        .upsert(batch, { onConflict: 'handle' })

      if (!error) productCount += batch.length
    }
  } catch (err) {
    console.error('Seed error', err)
  }

  return { products: productCount, designers: designerCount }
}

export const COLLECTIONS = [
  'accessories', 'dresses', 'coats-jackets', 'games', 'home',
  'kimonos', 'knitwear', 'jewelry', 'perfumes', 'skirts',
  'shoes', 'shorts', 'pets-corner', 'textiles', 'tops', 'trousers',
]

export const JOURNAL_CATEGORIES = [
  'All', 'Maker Portraits', 'Craft & Culture', 'Events', 'New Arrivals', 'Behind the Story',
]

export const DESIGNER_ORIGINS: Record<string, string> = {
  'Injiri': 'Jaipur, India',
  'Gudrun & Gudrun': 'Faroe Islands',
  'Marrakshi Life': 'Marrakesh, Morocco',
  'Ka-Sha': 'India',
  'Kilometre Paris': 'Paris, France',
  'Litkovska': 'Kyiv, Ukraine',
}
