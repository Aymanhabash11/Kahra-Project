import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import React from 'react'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { ToastProvider } from './context/ToastContext'
import { useAuth } from './context/AuthContext'

import MainLayout from './layouts/MainLayout'
import AuthLayout from './layouts/AuthLayout'
import AdminLayout from './layouts/AdminLayout'

import Home from './pages/Home'
import Collection from './pages/Collection'
import Designers from './pages/Designers'
import Product from './pages/Product'
import OurStory from './pages/OurStory'
import Journal from './pages/Journal'
import JournalPost from './pages/JournalPost'
import Cart from './pages/Cart'
import Profile from './pages/Profile'
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'
import OrderSuccess from './pages/OrderSuccess'
import Dashboard from './pages/admin/Dashboard'
import AdminProducts from './pages/admin/AdminProducts'
import AdminDesigners from './pages/admin/AdminDesigners'
import AdminJournal from './pages/admin/AdminJournal'
import AdminReports from './pages/admin/AdminReports'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  if (profile && profile.role !== 'admin') return <Navigate to="/" replace />
  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public — main layout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/collection" element={<Collection />} />
        <Route path="/designers" element={<Designers />} />
        <Route path="/product/:handle" element={<Product />} />
        <Route path="/our-story" element={<OurStory />} />
        <Route path="/journal" element={<Journal />} />
        <Route path="/journal/:slug" element={<JournalPost />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/order/success" element={<OrderSuccess />} />
        <Route path="/profile" element={
          <ProtectedRoute><Profile /></ProtectedRoute>
        } />
      </Route>

      {/* Auth — no nav/footer */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Route>

      {/* Admin — sidebar layout */}
      <Route path="/admin" element={
        <AdminRoute><AdminLayout /></AdminRoute>
      }>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="designers" element={<AdminDesigners />} />
        <Route path="journal" element={<AdminJournal />} />
        <Route path="reports" element={<AdminReports />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <ToastProvider>
            <AppRoutes />
          </ToastProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
