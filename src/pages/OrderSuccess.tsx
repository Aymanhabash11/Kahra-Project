import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useCart } from '../context/CartContext'

interface Order {
  id: string
  total: number
  currency: string
  status: string
  items: { product_title: string; quantity: number; product_price: number }[]
  customer_email: string
}

export default function OrderSuccess() {
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [order, setOrder] = useState<Order | null>(null)
  const { clearCart } = useCart()

  useEffect(() => {
    clearCart()

    if (!sessionId) return
    const poll = setInterval(async () => {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('session_id', sessionId)
        .single()
      if (data) {
        setOrder(data as Order)
        clearInterval(poll)
      }
    }, 1500)

    setTimeout(() => clearInterval(poll), 15000)
    return () => clearInterval(poll)
  }, [sessionId])

  return (
    <div style={{ minHeight: '100vh', paddingTop: 'var(--nav-h)', background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--nav-h) 2rem 4rem' }}>
      <div style={{ maxWidth: '560px', width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>✓</div>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 300, fontSize: 'clamp(2rem, 4vw, 3rem)', color: 'var(--charcoal)', marginBottom: '1rem' }}>
          Thank you for your order
        </h1>
        <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.85rem', fontWeight: 300, color: 'var(--muted)', lineHeight: 1.9, marginBottom: '2.5rem' }}>
          Your payment was successful. You will receive a confirmation email shortly.
          Our team in Geneva will carefully prepare your order.
        </p>

        {order && (
          <div style={{ background: 'var(--white)', border: '1px solid var(--sand)', padding: '2rem', marginBottom: '2.5rem', textAlign: 'left' }}>
            <div style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.6rem', fontWeight: 300, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '1.2rem' }}>
              Order Summary
            </div>
            {(order.items ?? []).map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid var(--sand)', fontFamily: 'Jost, sans-serif', fontSize: '0.8rem', fontWeight: 300, color: 'var(--charcoal)' }}>
                <span>{item.product_title} × {item.quantity}</span>
                <span>${(item.product_price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', fontFamily: 'Cormorant Garamond, serif', fontSize: '1.2rem', fontWeight: 300, color: 'var(--charcoal)' }}>
              <span>Total</span>
              <span>${Number(order.total).toFixed(2)}</span>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/collection" className="btn btn-primary">Continue Shopping</Link>
          <Link to="/" className="btn btn-outline" style={{ color: 'var(--charcoal)', borderColor: 'var(--sand)' }}>Back to Home</Link>
        </div>
      </div>
    </div>
  )
}
