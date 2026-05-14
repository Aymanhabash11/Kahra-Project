import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-06-20',
  httpClient: Stripe.createFetchHttpClient(),
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CartItem {
  product_id: string
  product_title: string
  product_image: string
  product_price: number
  product_vendor?: string
  quantity: number
  size: string
  color: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { items, userId, customerEmail } = await req.json() as {
      items: CartItem[]
      userId?: string
      customerEmail?: string
    }

    if (!items?.length) {
      return new Response(JSON.stringify({ error: 'Cart is empty' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const origin = req.headers.get('origin') ?? 'http://localhost:5173'

    // Build Stripe line items
    const lineItems = items.map(item => ({
      price_data: {
        currency: 'chf',
        product_data: {
          name: item.product_title,
          images: item.product_image ? [item.product_image] : [],
          metadata: {
            vendor: item.product_vendor ?? '',
            size: item.size,
            color: item.color,
          },
        },
        unit_amount: Math.round(item.product_price * 100), // CHF cents (rappen)
      },
      quantity: item.quantity,
    }))

    const total = items.reduce((s, i) => s + i.product_price * i.quantity, 0)

    // Create a pending order in DB
    const { data: order } = await supabase.from('orders').insert({
      user_id: userId ?? null,
      status: 'pending',
      total,
      currency: 'CHF',
      items,
      customer_email: customerEmail ?? null,
    }).select().single()

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      currency: 'chf',
      customer_email: customerEmail,
      success_url: `${origin}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart`,
      metadata: {
        order_id: order?.id ?? '',
        user_id: userId ?? '',
      },
      shipping_address_collection: {
        allowed_countries: ['CH', 'DE', 'FR', 'AT', 'IT', 'GB', 'US', 'SA', 'AE'],
      },
    })

    // Store Stripe session ID on the order
    if (order?.id) {
      await supabase.from('orders')
        .update({ session_id: session.id })
        .eq('id', order.id)
    }

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
