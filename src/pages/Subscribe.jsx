import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { products } from '../data/products.js'
import { buildRoutine } from '../data/routine.js'
import { calcPrice, formatWon, FREE_SHIPPING_MIN, SHIPPING_FEE } from '../lib/pricing.js'
import { hasFreeCoupon, loadRoutine, saveSubscription, spendFreeCoupon } from '../lib/storage.js'
import { useMember } from '../lib/useMember.js'
import {
  EMPTY_CONTACT,
  focusFirstError,
  pickRecipient,
  validateContact,
} from '../lib/contactForm.js'
import { AgreeCheck, ContactFields, RequiredMark } from '../components/ContactFields.jsx'
import OrderNoNotice from '../components/OrderNoNotice.jsx'
import icon1 from '../assets/images/icon-1.jpg'
import icon2 from '../assets/images/icon-2.jpg'
import icon3 from '../assets/images/icon-3.jpg'
import './Subscribe.css'

const CONDITIONS = [
  { icon: icon1, title: '주 1회 배송', body: ['고른 구성대로 일주일에 한 번', '보내 드려요.'] },
  { icon: icon2, title: '변경은 언제든', body: ['구성은 조건 없이 언제든', '간단하게 바꿀 수 있어요.'] },
  { icon: icon3, title: '해지도 조건 없이', body: ['해지도 조건 없이 언제든', '간단하게 할 수 있어요.'] },
]

// 루틴 구성 = 루틴 만들기에서 고른 루틴의 일주일 구성 (P03-S03, 답변 2026-11-16)
// 루틴을 아직 안 골랐으면 기본값(오전 8시 · 주 5일 출근)
function loadRoutineItems() {
  const saved = loadRoutine()
  return buildRoutine(saved?.tick ?? 2, saved?.chip ?? 0).map(({ product, weeklyQty }) => ({
    id: `r-${product.id}`,
    name: product.name,
    nameKo: product.nameKo,
    sub: `${product.ingredients} · ${product.volume}`,
    image: product.image,
    unitPrice: product.unitPrice,
    initialQty: weeklyQty,
  }))
}

const DIRECT_ITEMS = products.map((p) => ({
  id: p.id,
  name: p.name,
  nameKo: p.nameKo,
  sub: `${p.ingredients} · ${p.volume}`,
  image: p.image,
  unitPrice: p.unitPrice,
}))

const TABS = [
  { id: 'routine', label: '루틴 구성' },
  { id: 'direct', label: '상품 직접 선택' },
]

const PAY_METHODS = ['카드', '계좌이체']

// 신청 정보 입력칸 — components/ContactFields.jsx, lib/contactForm.js (정기배송 · 주문하기 공통)

// P-04 정기배송 신청
function Subscribe() {
  const location = useLocation()
  const [tab, setTab] = useState(location.state?.tab === 'direct' ? 'direct' : 'routine')
  const [routineItems] = useState(loadRoutineItems)
  const [qty, setQty] = useState(() => ({
    ...Object.fromEntries(routineItems.map((it) => [it.id, it.initialQty])),
    ...Object.fromEntries(DIRECT_ITEMS.map((it) => [it.id, 0])),
  }))
  const [form, setForm] = useState(EMPTY_CONTACT)
  const [agree, setAgree] = useState(false)
  const [payMethod, setPayMethod] = useState(PAY_METHODS[0])
  const [errors, setErrors] = useState({})
  const [done, setDone] = useState(false)
  const doneRef = useRef(null)

  // 가입 무료 단품 — 루틴 구성으로 신청할 때 6개 중 하나를 골라 첫 상자에 동봉 (답변 2026-11-16)
  // 고르지 않으면 받지 않고, 무료권은 그대로 남아 1회 주문에서 쓸 수 있음
  const member = useMember()
  const coupon = hasFreeCoupon(member)
  const [freePick, setFreePick] = useState(null)
  const [freeDone, setFreeDone] = useState(null)
  const freeProduct = coupon && tab === 'routine' ? products.find((p) => p.id === freePick) : null

  const items = tab === 'routine' ? routineItems : DIRECT_ITEMS
  const summary = items
    .filter((it) => qty[it.id] > 0)
    .map((it) => ({ ...it, qty: qty[it.id] }))
  const price = calcPrice(summary, tab)

  function changeQty(id, delta) {
    setQty((q) => ({ ...q, [id]: Math.max(0, (q[id] || 0) + delta) }))
    setErrors((e) => ({ ...e, items: undefined }))
  }

  function changeField(id, value) {
    setForm((f) => ({ ...f, [id]: value }))
    setErrors((e) => ({ ...e, [id]: undefined }))
  }

  function changeAgree(checked) {
    setAgree(checked)
    if (checked) setErrors((e) => ({ ...e, agree: undefined }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    // 이름 · 전화번호(형식) · 배송지 · 동의 필수, 비회원은 주문 비밀번호도 (답변 2026-11-13, 2026-11-16)
    const guest = !member
    const next = validateContact(form, agree, guest)
    if (summary.length === 0) next.items = '상품을 1개 이상 담아 주세요.'
    setErrors(next)
    if (Object.keys(next).length > 0) {
      focusFirstError('f', next, 'f-agree')
      return
    }
    const no = await saveSubscription(
      {
        tab,
        items: summary.map((it) => ({
          id: it.id,
          name: it.name,
          qty: it.qty,
          unitPrice: it.unitPrice,
        })),
        price,
        payMethod,
        recipient: pickRecipient(form),
        freeItem: freeProduct ? { id: freeProduct.id, name: freeProduct.name, qty: 1 } : null,
      },
      { member, password: guest ? form.orderPassword : null },
    )
    if (freeProduct) spendFreeCoupon(member)
    setFreeDone(freeProduct?.name ?? null)
    setDone({ no, guest })
  }

  // 신청 후 양식 자리가 완료 문구로 바뀌고 그 위치로 스크롤
  useEffect(() => {
    if (done) doneRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [done])

  return (
    <div className="band-white">
      <main className="container subscribe">
        <h1 className="page-title subscribe-title">정기배송 신청</h1>

        {/* P04-S01 조건 안내 */}
        <section id="P04-S01" className="conditions" aria-label="정기배송 조건">
          {CONDITIONS.map((c) => (
            <div key={c.title} className="condition">
              <div className="photo condition-icon">
                <img src={c.icon} alt="" />
              </div>
              <div>
                <h2 className="condition-title">{c.title}</h2>
                <p className="condition-body">
                  {c.body[0]}
                  <br />
                  {c.body[1]}
                </p>
              </div>
            </div>
          ))}
        </section>

        {!done && (
          <>
            {/* P04-S02 구성 선택 */}
            <section id="P04-S02" className="pick" aria-labelledby="pick-title">
              <div className="section-title pick-heading">
                <h2 id="pick-title">구성 선택</h2>
              </div>
              <div role="tablist" aria-label="구성 방식" className="tabs">
                {TABS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    role="tab"
                    aria-selected={tab === t.id}
                    className={tab === t.id ? 'tab is-on' : 'tab'}
                    onClick={() => setTab(t.id)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              {items.map((it) => (
                <div key={it.id} className="pick-row">
                  {it.image ? (
                    <div className="photo pick-photo">
                      <img src={it.image} alt="" />
                    </div>
                  ) : (
                    <div className="photo photo-empty pick-photo">이미지</div>
                  )}
                  <div className="pick-info">
                    <h3 className="pick-name">
                      {it.name}
                      <span className="pick-name-ko">{it.nameKo}</span>
                    </h3>
                    <p className="pick-sub">{it.sub}</p>
                  </div>
                  <div role="group" aria-label={`${it.name} 수량`} className="stepper">
                    <button
                      type="button"
                      aria-label={`${it.name} 수량 줄이기`}
                      onClick={() => changeQty(it.id, -1)}
                    >
                      −
                    </button>
                    <span aria-live="polite">{qty[it.id] || 0}</span>
                    <button
                      type="button"
                      aria-label={`${it.name} 수량 늘리기`}
                      onClick={() => changeQty(it.id, 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
              {tab === 'routine' ? (
                <>
                  <p className="pick-benefit">
                    <span className="tag tag-brand">루틴 혜택</span>
                    {coupon ? (
                      <span>
                        루틴 구성으로 신청하면 첫 회 배송 무료 · 배송비 매회 무료 · 가입 무료
                        단품 동봉이 자동으로 적용돼요.
                      </span>
                    ) : (
                      <span>
                        루틴 구성으로 신청하면 첫 회 배송 무료 · 배송비 매회 무료가 자동으로
                        적용돼요.
                      </span>
                    )}
                  </p>
                  {/* 비회원: 고르는 칸 대신 가입 안내 / 무료권을 이미 쓴 회원: 보이지 않음 */}
                  {!member && (
                    <p className="free-join">
                      가입하면 무료 단품을 하나 골라 첫 상자에 넣어 드려요.{' '}
                      <Link to="/join">가입하기</Link>
                    </p>
                  )}
                  {coupon && (
                    <div className="free-pick">
                      <p id="free-label" className="free-label">
                        가입 무료 단품 고르기
                        <span className="muted">
                          {' '}
                          · 첫 상자에 1개 넣어 드려요. 고르지 않으면 무료권은 그대로 남아요.
                        </span>
                      </p>
                      <div role="radiogroup" aria-labelledby="free-label" className="free-options">
                        {products.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            role="radio"
                            aria-checked={freePick === p.id}
                            className={freePick === p.id ? 'free-option is-on' : 'free-option'}
                            onClick={() => setFreePick(freePick === p.id ? null : p.id)}
                          >
                            <span className="photo free-photo">
                              <img src={p.image} alt="" />
                            </span>
                            <span className="free-name">{p.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <p className="pick-note">
                    {formatWon(FREE_SHIPPING_MIN)} 이상이면 배송비가 무료예요. 그보다 적으면
                    배송비 {formatWon(SHIPPING_FEE)}이 붙어요.
                  </p>
                </>
              )}
            </section>

            {/* P04-S03 신청 양식 */}
            <section id="P04-S03" aria-labelledby="form-title">
              <div className="section-title form-heading">
                <h2 id="form-title">신청 정보</h2>
              </div>
              <form className="apply" onSubmit={handleSubmit} noValidate>
                <div className="apply-fields">
                  <p className="req-note">
                    <RequiredMark /> 표시는 꼭 입력해 주세요.
                  </p>
                  <ContactFields
                    prefix="f"
                    form={form}
                    errors={errors}
                    onChange={changeField}
                    guest={!member}
                  />
                  {/* 결제 방식: 고르기만 하고 실제 결제는 없음 (답변 2026-11-13) */}
                  <div className="field">
                    <p id="pay-label" className="pay-label">
                      결제 방식
                      <RequiredMark />
                    </p>
                    <div role="radiogroup" aria-labelledby="pay-label" className="pay-options">
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
                <div className="apply-side">
                  <aside className="summary" aria-labelledby="sum-title">
                    <h3 id="sum-title" className="summary-title">
                      구성 · 가격 요약
                    </h3>
                    {summary.length === 0 && (
                      <p className="summary-empty">담은 상품이 없어요.</p>
                    )}
                    {summary.map((it) => (
                      <div key={it.id} className="summary-row">
                        <span>
                          {it.name} × {it.qty}
                        </span>
                        <span>{formatWon(it.unitPrice * it.qty)}</span>
                      </div>
                    ))}
                    {freeProduct && (
                      <div className="summary-row">
                        <span>
                          {freeProduct.name} × 1{' '}
                          <span className="muted">· 가입 무료 단품, 첫 상자만</span>
                        </span>
                        <span>{formatWon(0)}</span>
                      </div>
                    )}
                    <div className="summary-rule" aria-hidden="true" />
                    <div className="summary-row">
                      <span className="muted">상품 합계</span>
                      <span>{formatWon(price.subtotal)}</span>
                    </div>
                    <div className="summary-row">
                      <span className="muted">
                        배송비
                        {tab === 'routine' && ' · 루틴 혜택 매회 무료'}
                      </span>
                      <span>{formatWon(price.shipping)}</span>
                    </div>
                    <div className="summary-total">
                      <span>1회 배송 합계</span>
                      <span>{formatWon(price.total)}</span>
                    </div>
                    <p className="summary-note">
                      주 1회 배송, 매회 이 금액이에요.
                    </p>
                  </aside>
                  {errors.items && <p className="field-error">{errors.items}</p>}
                  <AgreeCheck
                    id="f-agree"
                    checked={agree}
                    error={errors.agree}
                    onChange={changeAgree}
                  />
                  <button type="submit" id="P04-B01" className="btn btn-primary btn-key">
                    정기배송 신청하기
                  </button>
                </div>
              </form>
            </section>
          </>
        )}

        {done && (
          /* P04-S04 완료 확인 */
          <section id="P04-S04" ref={doneRef} className="complete" aria-live="polite">
            <h2 className="complete-title">정기배송 신청이 완료됐어요</h2>
            <OrderNoNotice no={done.no} guest={done.guest} />
            <p className="complete-body">
              주 1회 배송으로 신청했어요.
              <br />
              {freeDone && (
                <>
                  첫 상자에 가입 무료 단품({freeDone} 1개)을 함께 넣어 드려요.
                  <br />
                </>
              )}
              구성 변경과 해지는 조건 없이 언제든 간단하게 할 수 있어요.
            </p>
            <Link to="/" id="P04-B02" className="btn btn-secondary">
              홈으로
            </Link>
          </section>
        )}
      </main>
    </div>
  )
}

export default Subscribe
