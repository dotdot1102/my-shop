import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { products } from '../data/products.js'
import { saveSubscription } from '../lib/storage.js'
import icon1 from '../assets/images/icon-1.jpg'
import icon2 from '../assets/images/icon-2.jpg'
import icon3 from '../assets/images/icon-3.jpg'
import './Subscribe.css'

const CONDITIONS = [
  { icon: icon1, title: '주 1회 배송', body: ['고른 구성대로 일주일에 한 번', '보내 드려요.'] },
  { icon: icon2, title: '변경은 언제든', body: ['구성은 조건 없이 언제든', '간단하게 바꿀 수 있어요.'] },
  { icon: icon3, title: '해지도 조건 없이', body: ['해지도 조건 없이 언제든', '간단하게 할 수 있어요.'] },
]

// 루틴 결과 상품은 결과 산출 기준이 [미정] — 시안의 자리 표시 그대로
const ROUTINE_ITEMS = [1, 2, 3].map((n) => ({
  id: `r${n}`,
  name: `루틴 결과 상품 ${n}`,
  sub: '루틴 만들기 결과에 따라 · 추후 결정',
}))

const DIRECT_ITEMS = products.map((p) => ({
  id: p.id,
  name: p.name,
  sub: `${p.ingredients} · ${p.volume}`,
  image: p.image,
}))

const TABS = [
  { id: 'routine', label: '루틴 구성' },
  { id: 'direct', label: '상품 직접 선택' },
]

// P-04 정기배송 신청
function Subscribe() {
  const location = useLocation()
  const [tab, setTab] = useState(location.state?.tab === 'direct' ? 'direct' : 'routine')
  const [qty, setQty] = useState({ r1: 1, r2: 1, r3: 1, abc: 0, cca: 0, green: 0, chip: 0 })
  const [done, setDone] = useState(false)
  const doneRef = useRef(null)

  const items = tab === 'routine' ? ROUTINE_ITEMS : DIRECT_ITEMS
  const summary = items.filter((it) => qty[it.id] > 0)

  function changeQty(id, delta) {
    setQty((q) => ({ ...q, [id]: Math.max(0, (q[id] || 0) + delta) }))
  }

  function handleSubmit() {
    saveSubscription({
      tab,
      items: summary.map((it) => ({ id: it.id, name: it.name, qty: qty[it.id] })),
    })
    setDone(true)
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
                    <h3 className="pick-name">{it.name}</h3>
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
                <p className="pick-benefit">
                  <span className="tag tag-brand">루틴 혜택</span>
                  <span>
                    루틴 구성으로 신청하면 첫 회 배송 무료 · 배송비 매회 무료 · 가입 무료 단품
                    동봉이 자동으로 적용돼요.
                  </span>
                </p>
              ) : (
                <p className="tbd pick-tbd">
                  상품 직접 선택 시 배송비 기준 · 루틴 혜택 적용 여부 — 추후 결정
                </p>
              )}
            </section>

            {/* P04-S03 신청 양식 */}
            <section id="P04-S03" aria-labelledby="form-title">
              <div className="section-title form-heading">
                <h2 id="form-title">신청 정보</h2>
              </div>
              <div className="apply">
                <div className="apply-fields">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="field">
                      <label htmlFor={`f${n}`}>
                        입력 항목 {n} <span>· 추후 결정</span>
                      </label>
                      <input className="input" id={`f${n}`} type="text" />
                    </div>
                  ))}
                  <p className="tbd">결제 방식 · 추후 결정</p>
                </div>
                <div className="apply-side">
                  <aside className="summary" aria-labelledby="sum-title">
                    <h3 id="sum-title" className="summary-title">
                      구성 · 가격 요약
                    </h3>
                    {summary.map((it) => (
                      <div key={it.id} className="summary-row">
                        <span>
                          {it.name} × {qty[it.id]}
                        </span>
                        <span className="muted">가격 추후 결정</span>
                      </div>
                    ))}
                    <div className="summary-rule" aria-hidden="true" />
                    <div className="summary-total">
                      <span>합계</span>
                      <span className="muted">추후 결정</span>
                    </div>
                  </aside>
                  <button
                    type="button"
                    id="P04-B01"
                    className="btn btn-primary btn-key"
                    onClick={handleSubmit}
                  >
                    정기배송 신청하기
                  </button>
                </div>
              </div>
            </section>
          </>
        )}

        {done && (
          /* P04-S04 완료 확인 */
          <section id="P04-S04" ref={doneRef} className="complete" aria-live="polite">
            <h2 className="complete-title">정기배송 신청이 완료됐어요</h2>
            <p className="complete-body">
              주 1회 배송으로 신청했어요.
              <br />
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
