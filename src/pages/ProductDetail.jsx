import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import ArrowIcon from '../components/ArrowIcon.jsx'
import { products } from '../data/products.js'
import { calcOrderPrice, formatWon, FREE_SHIPPING_MIN, SHIPPING_FEE } from '../lib/pricing.js'
import { addToCart } from '../lib/storage.js'
import './ProductDetail.css'

// 상품 상세 — 상품 카드를 누르면 들어옴 (답변 2026-11-16)
// 설명 · 판매가 · 배송 방법(택배) · 배송비 · 수량 · 주문 버튼
function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const product = products.find((p) => p.id === id)
  const [qty, setQty] = useState(1)
  // 장바구니에 담은 뒤 버튼 아래 안내 한 줄 (답변 2026-11-16)
  const [added, setAdded] = useState(false)

  if (!product) return <Navigate to="/products" replace />

  const price = calcOrderPrice(product.unitPrice, qty)

  return (
    <div className="band-white">
      <main className="container detail">
        <p className="detail-back">
          {/* 테두리 버튼 + 왼쪽 화살표 (답변 2026-11-16, A안) */}
          <Link to="/products" className="btn btn-secondary detail-back-btn">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M10 3.5 5.5 8l4.5 4.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            상품 목록
          </Link>
        </p>

        <div className="detail-inner">
          <div className="photo detail-photo">
            <img src={product.image} alt={`${product.nameKo} 상품과 재료`} />
          </div>

          <div className="detail-info">
            <div className="detail-head">
              {/* 영문 이름 + 아래 작은 한글 이름 (답변 2026-11-16) */}
              <h1 className="page-title detail-name">
                {product.name}
                <span className="detail-name-ko">{product.nameKo}</span>
              </h1>
              <p className="detail-sub">
                {product.ingredients} · {product.volume}
              </p>
            </div>

            {product.description ? (
              <p className="detail-desc">{product.description}</p>
            ) : (
              <p className="tbd">상품 설명 — 추후 결정</p>
            )}

            <dl className="detail-spec">
              <div>
                <dt>판매가</dt>
                <dd className="detail-price">{product.price}</dd>
              </div>
              <div>
                <dt>배송 방법</dt>
                <dd>택배</dd>
              </div>
              <div>
                <dt>배송비</dt>
                <dd>
                  {formatWon(SHIPPING_FEE)}
                  <span className="muted"> ({formatWon(FREE_SHIPPING_MIN)} 이상 무료)</span>
                </dd>
              </div>
              {product.howTo && (
                <div>
                  <dt>추천</dt>
                  <dd>{product.howTo}</dd>
                </div>
              )}
            </dl>

            <div className="detail-qty">
              <p id="qty-label" className="detail-qty-label">
                수량
              </p>
              <div role="group" aria-labelledby="qty-label" className="stepper">
                <button
                  type="button"
                  aria-label="수량 줄이기"
                  disabled={qty <= 1}
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                >
                  −
                </button>
                <span aria-live="polite">{qty}</span>
                <button type="button" aria-label="수량 늘리기" onClick={() => setQty((q) => q + 1)}>
                  +
                </button>
              </div>
            </div>

            <div className="detail-total">
              <div className="summary-row">
                <span className="muted">상품 금액</span>
                <span>{formatWon(price.subtotal)}</span>
              </div>
              <div className="summary-row">
                <span className="muted">배송비</span>
                <span>{formatWon(price.shipping)}</span>
              </div>
              <div className="summary-total">
                <span>합계</span>
                <span>{formatWon(price.total)}</span>
              </div>
            </div>

            {/* 장바구니 담기 · 주문하기 나란히 반반 (답변 2026-11-16) */}
            <div className="detail-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  addToCart(product.id, qty)
                  setAdded(true)
                }}
              >
                장바구니 담기
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => navigate(`/order/${product.id}`, { state: { qty } })}
              >
                주문하기
                <ArrowIcon />
              </button>
            </div>
            <p className="detail-added" role="status">
              {added && (
                <>
                  장바구니에 담았어요 ·{' '}
                  <Link to="/cart" className="text-link">
                    장바구니 보기
                  </Link>
                </>
              )}
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default ProductDetail
