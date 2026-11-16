import { useEffect, useState } from 'react'
import { products } from '../data/products.js'
import { CART_EVENT, loadCart } from './storage.js'

// 장바구니 (담거나 바꾸면 바로 갱신) — 상품 정보를 붙여서 돌려줌
// 상품 목록에서 사라진 id는 빼고 보여 줌
export function useCart() {
  const [cart, setCart] = useState(loadCart)

  useEffect(() => {
    const update = () => setCart(loadCart())
    window.addEventListener(CART_EVENT, update)
    window.addEventListener('storage', update)
    return () => {
      window.removeEventListener(CART_EVENT, update)
      window.removeEventListener('storage', update)
    }
  }, [])

  return cart
    .map((line) => ({ ...line, product: products.find((p) => p.id === line.id) }))
    .filter((line) => line.product)
}

// 메뉴 아이콘에 보여 줄 담은 개수(수량 합)
export function cartCount(lines) {
  return lines.reduce((sum, line) => sum + line.qty, 0)
}
