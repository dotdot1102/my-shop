import { useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import IntroGate from './components/IntroGate.jsx'
import { shouldShowIntro } from './lib/intro.js'
import Layout from './components/Layout.jsx'
import RequireMember from './components/RequireMember.jsx'
import Home from './pages/Home.jsx'
import Join from './pages/Join.jsx'
import Routine from './pages/Routine.jsx'
import Subscribe from './pages/Subscribe.jsx'
import Products from './pages/Products.jsx'
import ProductDetail from './pages/ProductDetail.jsx'
import Order from './pages/Order.jsx'
import Cart from './pages/Cart.jsx'
import OrderLookup from './pages/OrderLookup.jsx'
import MyPage from './pages/MyPage.jsx'

function App() {
  const [showIntro, setShowIntro] = useState(shouldShowIntro)

  return (
    <>
      {showIntro && <IntroGate onDone={() => setShowIntro(false)} />}
      <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/join" element={<Join />} />
        <Route
          path="/routine"
          element={
            <RequireMember>
              <Routine />
            </RequireMember>
          }
        />
        <Route path="/subscribe" element={<Subscribe />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/order/:id" element={<Order />} />
        {/* 장바구니 · 장바구니 주문 (답변 2026-11-16) */}
        <Route path="/cart" element={<Cart />} />
        <Route path="/order" element={<Order />} />
        {/* 비회원 주문 조회 (답변 2026-11-16) */}
        <Route path="/order-lookup" element={<OrderLookup />} />
        {/* 마이페이지 — 회원만 (답변 2026-11-16) */}
        <Route
          path="/mypage"
          element={
            <RequireMember>
              <MyPage />
            </RequireMember>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
      </Routes>
    </>
  )
}

export default App
