import { useCart } from '../context/CartContext'
import { Link } from 'react-router-dom'
import '../styles/cart.css'

export default function CartSidebar() {
  const { items, cartOpen, setCartOpen, removeItem, updateQuantity, total } = useCart()

  return (
    <>
      <div
        className={`cart-overlay${cartOpen ? ' open' : ''}`}
        onClick={() => setCartOpen(false)}
      />
      <div className={`cart-sidebar${cartOpen ? ' open' : ''}`}>
        <div className="cart-header">
          <h3>
            Your Bag
            {items.length > 0 && (
              <span className="cart-count-badge">{items.length}</span>
            )}
          </h3>
          <button className="cart-close" onClick={() => setCartOpen(false)}>✕</button>
        </div>

        <div className="cart-items-list">
          {items.length === 0 ? (
            <div className="cart-empty">
              <p>Your bag is empty.</p>
              <Link to="/collection" className="cart-empty-cta" onClick={() => setCartOpen(false)}>
                Explore Collection
              </Link>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} className="cart-item">
                <img
                  src={item.product_image}
                  alt={item.product_title}
                  className="cart-item-img"
                />
                <div className="cart-item-info">
                  {item.product_vendor && (
                    <div className="cart-item-designer">{item.product_vendor}</div>
                  )}
                  <div className="cart-item-name">{item.product_title}</div>
                  {(item.size || item.color) && (
                    <div className="cart-item-variant">
                      {[item.size, item.color].filter(Boolean).join(' · ')}
                    </div>
                  )}
                  <div className="cart-item-qty-row">
                    <button className="cart-item-qty-btn"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
                    <span className="cart-item-qty-num">{item.quantity}</span>
                    <button className="cart-item-qty-btn"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                  <div className="cart-item-price">
                    ${(item.product_price * item.quantity).toFixed(2)}
                  </div>
                  <button className="cart-item-remove" onClick={() => removeItem(item.id)}>✕</button>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="cart-footer">
            <div className="cart-subtotal">
              <span className="cart-subtotal-label">Subtotal</span>
              <span className="cart-subtotal-amount">${total.toFixed(2)}</span>
            </div>
            <p className="cart-note">Shipping & taxes calculated at checkout.</p>
            <Link
              to="/cart"
              className="cart-checkout-btn"
              onClick={() => setCartOpen(false)}
            >
              View Bag & Checkout
            </Link>
            <button className="cart-continue-btn" onClick={() => setCartOpen(false)}>
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  )
}
