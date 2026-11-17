import { DELIVERY_DAYS } from '../lib/delivery.js'
import { RequiredMark } from './ContactFields.jsx'
import './DeliveryDayPicker.css'

// 배송 요일 고르기 — 정기배송 신청 · 구성 변경 공통 (답변 2026-11-17)
// 칩 모양은 결제 방식(.chip)과 같음
function DeliveryDayPicker({ id, value, onChange, hint }) {
  const labelId = `${id}-label`
  return (
    <div className="field">
      <p id={labelId} className="pay-label">
        배송 요일
        <RequiredMark />
      </p>
      <div role="radiogroup" aria-labelledby={labelId} className="pay-options day-options">
        {DELIVERY_DAYS.map((day, i) => (
          <button
            key={day}
            type="button"
            role="radio"
            aria-checked={value === i}
            aria-label={`${day}요일`}
            className={value === i ? 'chip is-on' : 'chip'}
            onClick={() => onChange(i)}
          >
            {day}
          </button>
        ))}
      </div>
      {hint && <p className="field-hint">{hint}</p>}
    </div>
  )
}

export default DeliveryDayPicker
