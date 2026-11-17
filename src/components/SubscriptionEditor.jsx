import { useState } from 'react'
import { products } from '../data/products.js'
import { calcPrice, formatWon, FREE_SHIPPING_MIN, SHIPPING_FEE } from '../lib/pricing.js'
import {
  DEFAULT_DELIVERY_DAY,
  firstDeliveryDate,
  formatDeliveryDate,
  isUpcoming,
  toDateKey,
} from '../lib/delivery.js'
import DeliveryDayPicker from './DeliveryDayPicker.jsx'
import './SubscriptionEditor.css'

// 정기배송 구성 변경 — 마이페이지 · 비회원 주문 조회 공통 (답변 2026-11-17)
// - 6개 상품 전체에서 수량을 정함(0이면 빠짐), 배송 요일도 바꿈
// - 루틴 구성으로 시작한 정기배송은 바꿔도 루틴 혜택(배송비 매회 무료) 유지
// - 상품은 1개 이상
// 루틴 구성으로 저장된 상품 id는 'r-상품id' 모양이라 앞을 떼고 맞춤
const baseId = (id) => String(id).replace(/^r-/, '')

function changedSubscription(record, qty, day, today = new Date()) {
  const lines = products
    .filter((p) => qty[p.id] > 0)
    .map((p) => ({ id: p.id, name: p.name, qty: qty[p.id], unitPrice: p.unitPrice }))
  const tab = record.tab === 'routine' ? 'routine' : 'direct'
  // 첫 배송 전이면 첫 배송일을 새 요일에 맞춰 다시 계산, 이미 시작했으면 그대로
  const firstDelivery =
    !record.firstDelivery || isUpcoming(record.firstDelivery, today)
      ? toDateKey(firstDeliveryDate(day, today))
      : record.firstDelivery
  return { items: lines, price: calcPrice(lines, tab), deliveryDay: day, firstDelivery }
}

function SubscriptionEditor({ record, onSave, onCancel }) {
  const [qty, setQty] = useState(() => {
    const start = Object.fromEntries(products.map((p) => [p.id, 0]))
    for (const it of record.items ?? []) start[baseId(it.id)] = it.qty
    return start
  })
  const [day, setDay] = useState(record.deliveryDay ?? DEFAULT_DELIVERY_DAY)
  const [error, setError] = useState('')

  const next = changedSubscription(record, qty, day)
  const isRoutine = record.tab === 'routine'
  const prefix = `edit-${record.no}`

  function changeQty(id, delta) {
    setQty((q) => ({ ...q, [id]: Math.max(0, q[id] + delta) }))
    setError('')
  }

  function handleSave() {
    if (next.items.length === 0) {
      setError('상품을 1개 이상 담아 주세요.')
      return
    }
    onSave(next)
  }

  return (
    <div className="sub-edit" role="group" aria-label={`${record.no} 구성 변경`}>
      <p className="sub-edit-title">구성 변경</p>

      <ul className="sub-edit-list">
        {products.map((p) => (
          <li key={p.id} className="sub-edit-row">
            <span className="photo sub-edit-photo">
              <img src={p.image} alt="" />
            </span>
            <span className="sub-edit-name">
              {p.name}
              <span className="muted"> · {p.price}</span>
            </span>
            <div role="group" aria-label={`${p.name} 수량`} className="stepper">
              <button
                type="button"
                aria-label={`${p.name} 수량 줄이기`}
                disabled={qty[p.id] <= 0}
                onClick={() => changeQty(p.id, -1)}
              >
                −
              </button>
              <span aria-live="polite">{qty[p.id]}</span>
              <button
                type="button"
                aria-label={`${p.name} 수량 늘리기`}
                onClick={() => changeQty(p.id, 1)}
              >
                +
              </button>
            </div>
          </li>
        ))}
      </ul>

      <DeliveryDayPicker
        id={`${prefix}-day`}
        value={day}
        onChange={setDay}
        hint={`첫 배송 ${formatDeliveryDate(next.firstDelivery)}`}
      />

      <div className="sub-edit-sum">
        <div className="summary-row">
          <span className="muted">상품 합계</span>
          <span>{formatWon(next.price.subtotal)}</span>
        </div>
        <div className="summary-row">
          <span className="muted">배송비{isRoutine && ' · 루틴 혜택 매회 무료'}</span>
          <span>{formatWon(next.price.shipping)}</span>
        </div>
        <div className="summary-total">
          <span>1회 배송 합계</span>
          <span>{formatWon(next.price.total)}</span>
        </div>
        <p className="sub-edit-note muted">
          {isRoutine
            ? '루틴으로 시작한 정기배송이라 구성을 바꿔도 배송비는 계속 무료예요.'
            : `${formatWon(FREE_SHIPPING_MIN)} 이상이면 배송비가 무료, 그보다 적으면 ${formatWon(SHIPPING_FEE)}이에요.`}
        </p>
      </div>

      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}

      <div className="sub-edit-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          취소
        </button>
        <button type="button" className="btn btn-primary" onClick={handleSave}>
          변경 저장
        </button>
      </div>
    </div>
  )
}

export default SubscriptionEditor
