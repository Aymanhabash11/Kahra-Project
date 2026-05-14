import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import '../styles/cart.css'

export default function Cart() {
  const { items, removeItem, updateQuantity, total, clearCart } = useCart()
  const { user } = useAuth()
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [checkoutError, setCheckoutError] = useState('')

  async function handleCheckout() {
    setCheckoutError('')
    setCheckoutLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          items,
          userId: user?.id,
          customerEmail: user?.email,
        },
      })
      if (error || !data?.url) throw new Error(error?.message ?? 'Checkout failed')
      window.location.href = data.url
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setCheckoutLoading(false)
    }
  }

  return (
    <div className="cart-page">
      <div className="cart-page-header">
        <div className="page-label">Shopping Bag</div>
        <h1>Your <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Selections</em></h1>
      </div>

      <div className="cart-page-body">
        {items.length === 0 ? (
          <div className="cart-page-empty">
            <h2>Your bag is empty</h2>
            <p>Discover our collection of handcrafted pieces from independent designers.</p>
            <Link to="/collection" className="btn btn-primary">Explore Collection</Link>
          </div>
        ) : (
          <>
            <div className="cart-page-items">
              {!user && (
                <div className="cart-guest-notice">
                  <Link to="/login">Sign in</Link> to save your bag and access it across devices.
                </div>
              )}

              {items.map(item => (
                <div key={item.id} className="cart-page-item">
                  <img src={item.product_image} alt={item.product_title} className="cart-page-item-img" />
                  <div>
                    {item.product_vendor && <div className="cart-item-designer">{item.product_vendor}</div>}
                    <div className="cart-item-name">{item.product_title}</div>
                    {(item.size || item.color) && (
                      <div className="cart-item-variant">{[item.size, item.color].filter(Boolean).join(' · ')}</div>
                    )}
                    <div className="cart-item-qty-row" style={{ marginTop: '0.8rem' }}>
                      <button className="cart-item-qty-btn" onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
                      <span className="cart-item-qty-num">{item.quantity}</span>
                      <button className="cart-item-qty-btn" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                    <div className="cart-item-price">${(item.product_price * item.quantity).toFixed(2)}</div>
                    <button className="cart-item-remove" onClick={() => removeItem(item.id)}>Remove</button>
                  </div>
                </div>
              ))}

              <button onClick={clearCart} style={{ marginTop: '1rem', fontFamily: 'Jost, sans-serif', fontSize: '0.65rem', fontWeight: 300, letterSpacing: '0.12em', textTransform: 'uppercase', background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer', textDecoration: 'underline' }}>
                Clear bag
              </button>
            </div>

            <div className="cart-page-summary">
              <h2>Order Summary</h2>
              <div className="summary-row">
                <span className="summary-label">Subtotal</span>
                <span className="summary-value">${total.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Shipping</span>
                <span className="summary-value">Calculated at checkout</span>
              </div>
              <div className="summary-total-row">
                <span className="summary-total-label">Total</span>
                <span className="summary-total-value">${total.toFixed(2)}</span>
              </div>
              <p className="cart-note" style={{ marginTop: '1rem' }}>
                Taxes included. Shipping calculated at checkout.
              </p>
              {checkoutError && (
                <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.72rem', color: '#c0392b', margin: '0.8rem 0' }}>
                  {checkoutError}
                </p>
              )}
              <button
                className="cart-checkout-btn"
                style={{ display: 'block', textAlign: 'center', marginTop: '1.5rem', opacity: checkoutLoading ? 0.7 : 1 }}
                onClick={handleCheckout}
                disabled={checkoutLoading}
              >
                {checkoutLoading ? 'Redirecting to checkout…' : 'Proceed to Checkout'}
              </button>
              <Link to="/collection" className="cart-continue-btn" style={{ display: 'block', textAlign: 'center', marginTop: '0.8rem', textDecoration: 'none' }}>
                Continue Shopping
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
