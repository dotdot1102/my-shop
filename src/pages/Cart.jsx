import { Link, useNavigate } from 'react-router-dom'
import ArrowIcon from '../components/ArrowIcon.jsx'
import { calcCartPrice, formatWon, FREE_SHIPPING_MIN, SHIPPING_FEE } from '../lib/pricing.js'
import { removeFromCart, setCartQty } from '../lib/storage.js'
import { useCart } from '../lib/useCart.js'
import './Cart.css'

// 장바구니 (답변 2026-11-16)
// - 비회원도 사용, 이 브라우저에 저장
// - 수량 조절 · 삭제 · 합계, '주문하기'를 누르면 담은 상품을 한꺼번에 1회 주문
function Cart() {
  const navigate = useNavigate()
  const lines = useCart()
  const price = calcCartPrice(lines.map((l) => ({ unitPrice: l.product.unitPrice, qty: l.qty })))

  return (
    <div className="band-white">
      <main className="container subscribe cart">
        <h1 className="page-title subscribe-title">장바구니</h1>

        {lines.length === 0 ? (
          <section className="cart-empty">
            <p>장바구니가 비어 있어요.</p>
            <Link to="/products" className="btn btn-secondary">
              상품 보러 가기
            </Link>
          </section>
        ) : (
          <div className="cart-inner">
            <section className="cart-list" aria-label="담은 상품">
              {lines.map(({ id, qty, product }) => (
                <div key={id} className="cart-row">
                  <Link to={`/products/${id}`} className="photo pick-photo cart-photo">
                    <img src={product.image} alt="" />
                  </Link>
                  <div className="pick-info">
                    <h2 className="pick-name">
                      <Link to={`/products/${id}`} className="cart-name-link">
                        {product.name}
                      </Link>
                    </h2>
                    <p className="pick-sub">
                      {product.ingredients} · {product.volume} · {product.price}
                    </p>
                  </div>
                  <div className="cart-controls">
                    <div role="group" aria-label={`${product.name} 수량`} className="stepper">
                      <button
                        type="button"
                        aria-label={`${product.name} 수량 줄이기`}
                        disabled={qty <= 1}
                        onClick={() => setCartQty(id, qty - 1)}
                      >
                        −
                      </button>
                      <span aria-live="polite">{qty}</span>
                      <button
                        type="button"
                        aria-label={`${product.name} 수량 늘리기`}
                        onClick={() => setCartQty(id, qty + 1)}
                      >
                        +
                      </button>
                    </div>
                    <p className="cart-line-price">{formatWon(product.unitPrice * qty)}</p>
                    <button
                      type="button"
                      className="cart-remove"
                      aria-label={`${product.name} 빼기`}
                      onClick={() => removeFromCart(id)}
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))}
            </section>

            <div className="apply-side">
              <aside className="summary" aria-labelledby="cart-sum-title">
                <h2 id="cart-sum-title" className="summary-title">
                  결제 예상 금액
                </h2>
                <div className="summary-row">
                  <span className="muted">상품 합계</span>
                  <span>{formatWon(price.subtotal)}</span>
                </div>
                <div className="summary-row">
                  <span className="muted">배송비 · 택배</span>
                  <span>{formatWon(price.shipping)}</span>
                </div>
                <div className="summary-total">
                  <span>합계</span>
                  <span>{formatWon(price.total)}</span>
                </div>
                {/* 안내 두 줄 (답변 2026-11-16, 3안) */}
                <p className="summary-note cart-note">
                  <span>
                    배송비: {FREE_SHIPPING_MIN / 10000}만 원 이상 무료, 미만 {formatWon(SHIPPING_FEE)}
                  </span>
                  <span>가입 무료권: 주문 화면에서 선택</span>
                </p>
              </aside>
              <button
                type="button"
                className="btn btn-primary btn-key"
                onClick={() => navigate('/order')}
              >
                주문하기
                <ArrowIcon />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default Cart
