import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useLocation, useParams } from 'react-router-dom'
import { products } from '../data/products.js'
import { calcCartPrice, calcOrderPrice, formatWon } from '../lib/pricing.js'
import { clearCart, hasFreeCoupon, saveOrder, spendFreeCoupon } from '../lib/storage.js'
import { useCart } from '../lib/useCart.js'
import { useMember } from '../lib/useMember.js'
import {
  EMPTY_CONTACT,
  focusFirstError,
  pickRecipient,
  validateContact,
} from '../lib/contactForm.js'
import { AgreeCheck, ContactFields, RequiredMark } from '../components/ContactFields.jsx'
import OrderNoNotice from '../components/OrderNoNotice.jsx'
import './ProductDetail.css'
import './Cart.css'

// 1회 주문 (답변 2026-11-16)
// - /order/:id — 상품 상세의 '주문하기', 상품 1종류
// - /order — 장바구니의 '주문하기', 담은 상품 전체
// - 비회원도 주문 가능, 결제 방식은 고르기만 하고 실제 결제는 없음 (정기배송과 같음)
// - 무료권(상품 1개 값 + 배송비 무료, 한 번 쓰면 사라짐)
//   · 상품 1종류 주문: 회원이고 무료권이 남아 있으면 자동 적용
//   · 장바구니 주문: 담은 상품 중 하나를 직접 고름, 고르지 않으면 무료권은 그대로 남음
const PAY_METHODS = ['카드', '계좌이체']

// 이름 · 전화번호 · 배송지 · 상세주소 · 결제 방식 · 동의 + 확인 (두 주문 화면 공통)
// 입력 칸과 규칙은 components/ContactFields.jsx, lib/contactForm.js (정기배송과 같음)
function useOrderForm(member) {
  const guest = !member
  const [form, setForm] = useState({ ...EMPTY_CONTACT, name: member?.name ?? '' })
  const [agree, setAgree] = useState(false)
  const [payMethod, setPayMethod] = useState(PAY_METHODS[0])
  const [errors, setErrors] = useState({})

  function changeField(fieldId, value) {
    setForm((f) => ({ ...f, [fieldId]: value }))
    setErrors((e) => ({ ...e, [fieldId]: undefined }))
  }

  function changeAgree(checked) {
    setAgree(checked)
    if (checked) setErrors((e) => ({ ...e, agree: undefined }))
  }

  // 빈 칸·잘못된 칸이 있으면 첫 칸으로 이동하고 false (비회원은 주문 비밀번호도 확인)
  function validate() {
    const next = validateContact(form, agree, guest)
    setErrors(next)
    if (Object.keys(next).length > 0) {
      focusFirstError('o', next, 'o-agree')
      return false
    }
    return true
  }

  // 동의 체크 — 결제 금액 아래, 주문 버튼 위
  const agreeCheck = (
    <AgreeCheck id="o-agree" checked={agree} error={errors.agree} onChange={changeAgree} />
  )

  const fields = (
    <div className="apply-fields">
      <p className="req-note">
        <RequiredMark /> 표시는 꼭 입력해 주세요.
      </p>
      <ContactFields
        prefix="o"
        form={form}
        errors={errors}
        onChange={changeField}
        guest={guest}
      />
      {/* 결제 방식: 고르기만 하고 실제 결제는 없음 */}
      <div className="field">
        <p id="order-pay-label" className="pay-label">
          결제 방식
          <RequiredMark />
        </p>
        <div role="radiogroup" aria-labelledby="order-pay-label" className="pay-options">
          {PAY_METHODS.map((m) => (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={payMethod === m}
              className={payMethod === m ? 'chip is-on' : 'chip'}
              onClick={() => setPayMethod(m)}
            >
              {m}
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  // 저장 옵션 — 비회원이면 주문 비밀번호를 함께 넘김
  const saveOptions = { member, password: guest ? form.orderPassword : null }

  return { form, payMethod, validate, fields, agreeCheck, saveOptions, guest }
}

// 주문 완료 — 양식 자리가 완료 문구로 바뀌고 그 위치로 스크롤
// lines: '○○ 2개를' 처럼 조사까지 붙인 문구, no: 주문번호, guest: 비회원이면 조회 안내
function OrderDone({ lines, total, no, guest }) {
  const doneRef = useRef(null)
  useEffect(() => {
    doneRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  return (
    <section ref={doneRef} className="complete" aria-live="polite">
      <h2 className="complete-title">주문이 완료됐어요</h2>
      <OrderNoNotice no={no} guest={guest} />
      <p className="complete-body">
        {lines} 택배로 보내 드릴게요.
        <br />
        결제 금액은 {formatWon(total)}이에요.
      </p>
      <Link to="/" className="btn btn-secondary">
        홈으로
      </Link>
    </section>
  )
}

function Order() {
  const { id } = useParams()
  return id ? <SingleOrder id={id} /> : <CartOrder />
}

// 상품 1종류 주문 (/order/:id)
function SingleOrder({ id }) {
  const location = useLocation()
  const member = useMember()
  const product = products.find((p) => p.id === id)
  const [qty, setQty] = useState(() => Math.max(1, Number(location.state?.qty) || 1))
  const { form, payMethod, validate, fields, agreeCheck, saveOptions, guest } =
    useOrderForm(member)
  const [done, setDone] = useState(null)

  if (!product) return <Navigate to="/products" replace />

  const coupon = hasFreeCoupon(member)
  const price = calcOrderPrice(product.unitPrice, qty, coupon)

  async function handleSubmit(event) {
    event.preventDefault()
    if (!validate()) return
    // 상품 목록은 장바구니 주문과 같은 모양(items)으로 저장 — 주문 조회에서 함께 보여 줌
    const no = await saveOrder(
      {
        items: [{ id: product.id, name: product.name, qty, unitPrice: product.unitPrice }],
        price,
        coupon,
        couponItem: coupon ? product.id : null,
        payMethod,
        delivery: '택배',
        recipient: pickRecipient(form),
      },
      saveOptions,
    )
    if (coupon) spendFreeCoupon(member)
    setDone({ lines: `${product.name} ${qty}개를`, total: price.total, no, guest })
  }

  return (
    <div className="band-white">
      <main className="container subscribe">
        <h1 className="page-title subscribe-title">주문하기</h1>

        {!done && (
          <>
            {/* 주문 상품 */}
            <section className="order-item" aria-label="주문 상품">
              <div className="photo pick-photo">
                <img src={product.image} alt="" />
              </div>
              <div className="pick-info">
                <h2 className="pick-name">
                  {product.name}
                  <span className="pick-name-ko">{product.nameKo}</span>
                </h2>
                <p className="pick-sub">
                  {product.ingredients} · {product.volume} · {product.price}
                </p>
                <p className="pick-sub">배송 방법: 택배</p>
              </div>
              <div role="group" aria-label={`${product.name} 수량`} className="stepper">
                <button
                  type="button"
                  aria-label={`${product.name} 수량 줄이기`}
                  disabled={qty <= 1}
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                >
                  −
                </button>
                <span aria-live="polite">{qty}</span>
                <button
                  type="button"
                  aria-label={`${product.name} 수량 늘리기`}
                  onClick={() => setQty((q) => q + 1)}
                >
                  +
                </button>
              </div>
            </section>

            {/* 주문 정보 */}
            <section aria-labelledby="order-form-title">
              <div className="section-title form-heading">
                <h2 id="order-form-title">주문 정보</h2>
              </div>
              <form className="apply" onSubmit={handleSubmit} noValidate>
                {fields}

                <div className="apply-side">
                  <aside className="summary" aria-labelledby="order-sum-title">
                    <h3 id="order-sum-title" className="summary-title">
                      결제 금액
                    </h3>
                    <div className="summary-row">
                      <span>
                        {product.name} × {qty}
                      </span>
                      <span>{formatWon(price.subtotal)}</span>
                    </div>
                    {coupon && (
                      <div className="summary-row">
                        <span className="muted">가입 무료권 · 단품 1개</span>
                        <span>−{formatWon(price.discount)}</span>
                      </div>
                    )}
                    <div className="summary-row">
                      <span className="muted">
                        배송비 · 택배
                        {coupon && ' · 무료권 적용'}
                      </span>
                      <span>{formatWon(price.shipping)}</span>
                    </div>
                    <div className="summary-total">
                      <span>합계</span>
                      <span>{formatWon(price.total)}</span>
                    </div>
                  </aside>
                  {coupon && (
                    <p className="order-coupon">
                      <span className="tag tag-brand">가입 혜택</span>
                      <span>단품 1회 무료권이 자동으로 적용됐어요.</span>
                    </p>
                  )}
                  {agreeCheck}
                  <button type="submit" className="btn btn-primary btn-key">
                    {formatWon(price.total)} 주문하기
                  </button>
                </div>
              </form>
            </section>
          </>
        )}

        {done && <OrderDone {...done} />}
      </main>
    </div>
  )
}

// 장바구니 주문 (/order) — 수량은 장바구니에서 바꿈
function CartOrder() {
  const member = useMember()
  const lines = useCart()
  const { form, payMethod, validate, fields, agreeCheck, saveOptions, guest } =
    useOrderForm(member)
  const [freePick, setFreePick] = useState(null)
  const [done, setDone] = useState(null)

  // 주문을 마치면 장바구니가 비워지므로, 완료 화면을 먼저 확인
  if (done) {
    return (
      <div className="band-white">
        <main className="container subscribe">
          <h1 className="page-title subscribe-title">주문하기</h1>
          <OrderDone {...done} />
        </main>
      </div>
    )
  }
  if (lines.length === 0) return <Navigate to="/cart" replace />

  const coupon = hasFreeCoupon(member)
  const freeLine = coupon ? lines.find((l) => l.id === freePick) : null
  const price = calcCartPrice(
    lines.map((l) => ({ unitPrice: l.product.unitPrice, qty: l.qty })),
    freeLine ? freeLine.product.unitPrice : null,
  )

  async function handleSubmit(event) {
    event.preventDefault()
    if (!validate()) return
    const no = await saveOrder(
      {
        items: lines.map((l) => ({
          id: l.id,
          name: l.product.name,
          qty: l.qty,
          unitPrice: l.product.unitPrice,
        })),
        price,
        coupon: Boolean(freeLine),
        couponItem: freeLine ? freeLine.id : null,
        payMethod,
        delivery: '택배',
        recipient: pickRecipient(form),
      },
      saveOptions,
    )
    if (freeLine) spendFreeCoupon(member)
    const first = lines[0].product.name
    setDone({
      lines:
        lines.length > 1
          ? `${first} 외 ${lines.length - 1}가지 상품을`
          : `${first} ${lines[0].qty}개를`,
      total: price.total,
      no,
      guest,
    })
    clearCart()
  }

  return (
    <div className="band-white">
      <main className="container subscribe">
        <h1 className="page-title subscribe-title">주문하기</h1>

        {/* 주문 상품 */}
        <section className="order-list" aria-label="주문 상품">
          {lines.map(({ id, qty, product }) => (
            <div key={id} className="order-item">
              <div className="photo pick-photo">
                <img src={product.image} alt="" />
              </div>
              <div className="pick-info">
                <h2 className="pick-name">
                  {product.name}
                  <span className="pick-name-ko">{product.nameKo}</span>
                </h2>
                <p className="pick-sub">
                  {product.ingredients} · {product.volume} · {product.price}
                </p>
                <p className="pick-sub">배송 방법: 택배</p>
              </div>
              <p className="order-qty">{qty}개</p>
            </div>
          ))}
          <p className="detail-back">
            <Link to="/cart" className="text-link">
              장바구니에서 수량 바꾸기
            </Link>
          </p>
        </section>

        {/* 주문 정보 */}
        <section aria-labelledby="order-form-title">
          <div className="section-title form-heading">
            <h2 id="order-form-title">주문 정보</h2>
          </div>
          <form className="apply" onSubmit={handleSubmit} noValidate>
            {fields}

            <div className="apply-side">
              {/* 가입 무료권 — 담은 상품 중 하나를 고름 (답변 2026-11-16) */}
              {coupon && (
                <div className="free-pick order-free-pick">
                  <p id="order-free-label" className="free-label">
                    가입 무료권 쓸 상품 고르기
                    <span className="muted">
                      {' '}
                      · 고른 상품 1개 값과 배송비가 무료예요. 고르지 않으면 무료권은 그대로 남아요.
                    </span>
                  </p>
                  <div role="radiogroup" aria-labelledby="order-free-label" className="free-options">
                    {lines.map(({ id, product }) => (
                      <button
                        key={id}
                        type="button"
                        role="radio"
                        aria-checked={freePick === id}
                        className={freePick === id ? 'free-option is-on' : 'free-option'}
                        onClick={() => setFreePick(freePick === id ? null : id)}
                      >
                        <span className="photo free-photo">
                          <img src={product.image} alt="" />
                        </span>
                        <span className="free-name">{product.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <aside className="summary" aria-labelledby="order-sum-title">
                <h3 id="order-sum-title" className="summary-title">
                  결제 금액
                </h3>
                {lines.map(({ id, qty, product }) => (
                  <div key={id} className="summary-row">
                    <span>
                      {product.name} × {qty}
                    </span>
                    <span>{formatWon(product.unitPrice * qty)}</span>
                  </div>
                ))}
                {freeLine && (
                  <div className="summary-row">
                    <span className="muted">가입 무료권 · {freeLine.product.name} 1개</span>
                    <span>−{formatWon(price.discount)}</span>
                  </div>
                )}
                <div className="summary-row">
                  <span className="muted">
                    배송비 · 택배
                    {freeLine && ' · 무료권 적용'}
                  </span>
                  <span>{formatWon(price.shipping)}</span>
                </div>
                <div className="summary-total">
                  <span>합계</span>
                  <span>{formatWon(price.total)}</span>
                </div>
              </aside>
              {agreeCheck}
              <button type="submit" className="btn btn-primary btn-key">
                {formatWon(price.total)} 주문하기
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  )
}

export default Order
