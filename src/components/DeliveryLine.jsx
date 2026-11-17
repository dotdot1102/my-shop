import { DELIVERY_DAYS, formatDeliveryDate } from '../lib/delivery.js'

// 정기배송 배송 요일 · 첫 배송일 한 줄 — 마이페이지 · 비회원 주문 조회 (답변 2026-11-17)
// 요일 기능 전에 신청한 기록은 요일이 없어 '배송 요일 미정'
function DeliveryLine({ record, as: Tag = 'p' }) {
  if (record.deliveryDay == null) {
    return <Tag className="muted delivery-line">배송 요일 미정 · 구성 변경에서 고를 수 있어요</Tag>
  }
  return (
    <Tag className="delivery-line">
      매주 {DELIVERY_DAYS[record.deliveryDay]}요일 배송
      {record.firstDelivery && (
        <span className="muted"> · 첫 배송 {formatDeliveryDate(record.firstDelivery)}</span>
      )}
    </Tag>
  )
}

export default DeliveryLine
