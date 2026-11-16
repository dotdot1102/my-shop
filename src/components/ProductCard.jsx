import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { addToCart } from '../lib/storage.js'

// 상품 카드 — 홈 상품 섹션(P01-S02)과 상품 더보기 페이지에서 함께 씀
// 카드를 누르면 상품 상세로 (답변 2026-11-16)
// 카드 아래 '장바구니 담기'는 1개씩 담고, 잠깐 '담았어요'로 바뀜 (답변 2026-11-16)
// 스타일은 pages/Home.css의 .product-* 클래스
const ADDED_MS = 1500

function ProductCard({ product: p }) {
  const [added, setAdded] = useState(false)

  useEffect(() => {
    if (!added) return undefined
    const timer = window.setTimeout(() => setAdded(false), ADDED_MS)
    return () => window.clearTimeout(timer)
  }, [added])

  return (
    <article className="product-card">
      <Link to={`/products/${p.id}`} className="product-card-link">
        <div className="photo product-photo">
          <img src={p.image} alt={`${p.name}와 재료`} />
        </div>
        <div className="product-info">
          <h3 className="product-name">{p.name}</h3>
          <p className="product-ingredients">{p.ingredients}</p>
          <p className="product-price-row">
            <span className="product-price">
              {p.volume} · {p.price}
            </span>
          </p>
          {p.howTo ? (
            <p className="product-howto">{p.howTo}</p>
          ) : (
            <p className="tbd product-tbd">언제 · 어떻게 먹을지 — 추후 결정</p>
          )}
        </div>
      </Link>
      <button
        type="button"
        className="btn btn-secondary product-cart-btn"
        aria-label={added ? `${p.name} 장바구니에 담았어요` : `${p.name} 장바구니 담기`}
        onClick={() => {
          addToCart(p.id, 1)
          setAdded(true)
        }}
      >
        {added ? '담았어요' : '장바구니 담기'}
      </button>
    </article>
  )
}

export default ProductCard
