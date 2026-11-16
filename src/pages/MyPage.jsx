import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { buildRoutine, CHIPS, TICK_SPOKEN } from '../data/routine.js'
import { formatWon } from '../lib/pricing.js'
import {
  cancelMemberRecord,
  hasFreeCoupon,
  listMemberRecords,
  loadRoutine,
  logOut,
  ORDER_STATUS,
} from '../lib/storage.js'
import { useMember } from '../lib/useMember.js'
import './MyPage.css'

// 마이페이지 (답변 2026-11-16)
// - 회원만 (비회원은 가입·로그인으로 보내고 로그인하면 돌아옴)
// - 한 페이지에 위아래로: 회원 정보 → 쿠폰 → 주문 내역 → 정기배송 → 내 루틴
// - 서버가 없어 이 브라우저에서 한 주문만 보임
function formatDate(iso) {
  const d = new Date(iso)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`
}

// 주문 · 정기배송 한 건
function RecordCard({ record, onClose }) {
  const isOrder = record.kind === 'order'
  const open = record.status === 'received' || record.status === 'active'
  return (
    <li className="my-record">
      <div className="my-record-head">
        <p className="my-record-no">{record.no}</p>
        <span className={open ? 'tag tag-brand' : 'tag'}>
          {ORDER_STATUS[record.status] ?? record.status}
        </span>
        <span className="my-record-date">{formatDate(record.at)}</span>
      </div>
      <ul className="my-record-items">
        {(record.items ?? []).map((it) => (
          <li key={it.id}>
            {it.name} × {it.qty}
          </li>
        ))}
        {record.freeItem && (
          <li className="muted">가입 무료 단품 · {record.freeItem.name} × 1</li>
        )}
      </ul>
      <div className="my-record-foot">
        <p>
          <span className="muted">{isOrder ? '결제 금액' : '1회 배송 금액'}</span>{' '}
          <strong>{formatWon(record.price?.total ?? 0)}</strong>
        </p>
        {open && (
          <button type="button" className="btn btn-secondary my-record-btn" onClick={onClose}>
            {isOrder ? '주문 취소' : '정기배송 해지'}
          </button>
        )}
      </div>
    </li>
  )
}

function MyPage() {
  const member = useMember()
  const navigate = useNavigate()
  const [records, setRecords] = useState(() => listMemberRecords(member))
  const coupon = hasFreeCoupon(member)
  const saved = loadRoutine()
  const routine = saved ? buildRoutine(saved.tick, saved.chip) : null

  if (!member) return null

  function handleLogOut() {
    logOut()
    navigate('/')
  }

  function handleClose(record) {
    const question =
      record.kind === 'order' ? '정말 이 주문을 취소할까요?' : '정말 정기배송을 해지할까요?'
    if (!window.confirm(question)) return
    cancelMemberRecord(member, record.no)
    setRecords(listMemberRecords(member))
  }

  return (
    <div className="band-white">
      <main className="container mypage">
        <h1 className="page-title">마이페이지</h1>

        {/* 회원 정보 */}
        <section className="my-section my-profile" aria-labelledby="my-profile-title">
          <h2 id="my-profile-title" className="my-title">
            회원 정보
          </h2>
          <dl className="detail-spec">
            <div>
              <dt>이름</dt>
              <dd>{member.name}</dd>
            </div>
            <div>
              <dt>이메일</dt>
              <dd>{member.email}</dd>
            </div>
          </dl>
          <button type="button" className="btn btn-secondary my-logout" onClick={handleLogOut}>
            로그아웃
          </button>
        </section>

        {/* 쿠폰 — 가입 혜택 무료권 (답변 2026-11-16: '가입 혜택' → '쿠폰') */}
        <section className="my-section" aria-labelledby="my-benefit-title">
          <h2 id="my-benefit-title" className="my-title">
            쿠폰
          </h2>
          <div className="my-benefit">
            <p>
              단품 1회 무료권{' '}
              <span className={coupon ? 'tag tag-brand' : 'tag'}>
                {coupon ? '남아 있어요' : '사용했어요'}
              </span>
            </p>
            {coupon && (
              <p className="muted my-benefit-note">
                상품 주문, 장바구니 주문, 정기배송(루틴 구성) 중 한 번 쓸 수 있어요. 쓴 주문은
                배송비도 무료예요.
              </p>
            )}
          </div>
        </section>

        {/* 주문 내역 */}
        <section className="my-section" aria-labelledby="my-orders-title">
          <h2 id="my-orders-title" className="my-title">
            주문 내역
          </h2>
          {records.orders.length === 0 ? (
            <p className="my-empty">
              아직 주문이 없어요.{' '}
              <Link to="/products" className="text-link">
                상품 보러 가기
              </Link>
            </p>
          ) : (
            <ul className="my-records">
              {records.orders.map((r) => (
                <RecordCard key={r.no} record={r} onClose={() => handleClose(r)} />
              ))}
            </ul>
          )}
        </section>

        {/* 정기배송 */}
        <section className="my-section" aria-labelledby="my-subs-title">
          <h2 id="my-subs-title" className="my-title">
            정기배송
          </h2>
          {records.subscriptions.length === 0 ? (
            <p className="my-empty">
              신청한 정기배송이 없어요.{' '}
              <Link to="/subscribe" className="text-link">
                정기배송 신청
              </Link>
            </p>
          ) : (
            <ul className="my-records">
              {records.subscriptions.map((r) => (
                <RecordCard key={r.no} record={r} onClose={() => handleClose(r)} />
              ))}
            </ul>
          )}
        </section>

        {/* 내 루틴 */}
        <section className="my-section" aria-labelledby="my-routine-title">
          <h2 id="my-routine-title" className="my-title">
            내 루틴
          </h2>
          {routine ? (
            <div className="my-routine">
              <p className="muted">
                {TICK_SPOKEN[saved.tick]} 출근 · {CHIPS[saved.chip]}
              </p>
              <ul className="my-routine-list">
                {routine.map((item) => (
                  <li key={item.product.id}>
                    <span className="my-routine-time">{item.time}</span>
                    {item.product.name}
                    <span className="muted">
                      {' '}
                      · 주 {item.weeklyQty}
                      {item.unit}
                    </span>
                  </li>
                ))}
              </ul>
              <Link to="/routine" className="text-link">
                루틴 다시 만들기
              </Link>
            </div>
          ) : (
            <p className="my-empty">
              아직 만든 루틴이 없어요.{' '}
              <Link to="/routine" className="text-link">
                루틴 만들기
              </Link>
            </p>
          )}
        </section>
      </main>
    </div>
  )
}

export default MyPage
