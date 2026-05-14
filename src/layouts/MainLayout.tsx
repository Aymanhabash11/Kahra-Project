import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import CartSidebar from '../components/CartSidebar'
import '../styles/globals.css'

export default function MainLayout() {
  return (
    <>
      <Navbar />
      <CartSidebar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  )
}
