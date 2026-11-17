// 정기배송 배송 요일 · 첫 배송일 (답변 2026-11-17)
// - 월~금 중 하나, 기본 월요일
// - 첫 배송일: 신청한 다음 날부터 가장 가까운 고른 요일 (자동 계산)
export const DELIVERY_DAYS = ['월', '화', '수', '목', '금']
export const DEFAULT_DELIVERY_DAY = 0

const pad = (n) => String(n).padStart(2, '0')

// 날짜 → 'YYYY-MM-DD' (저장용, 그 지역 날짜 기준)
export function toDateKey(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function fromDateKey(key) {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

// dayIndex: 0(월) ~ 4(금). from 다음 날부터 가장 가까운 그 요일
export function firstDeliveryDate(dayIndex, from = new Date()) {
  const target = dayIndex + 1 // Date.getDay(): 월=1 … 금=5
  const date = new Date(from.getFullYear(), from.getMonth(), from.getDate() + 1)
  while (date.getDay() !== target) date.setDate(date.getDate() + 1)
  return date
}

// '11월 23일(월)'
export function formatDeliveryDate(dateOrKey) {
  const date = typeof dateOrKey === 'string' ? fromDateKey(dateOrKey) : dateOrKey
  const day = DELIVERY_DAYS[date.getDay() - 1] ?? ''
  return `${date.getMonth() + 1}월 ${date.getDate()}일(${day})`
}

// 첫 배송일이 아직 오지 않았는지 (오늘 포함하지 않음)
export function isUpcoming(dateKey, today = new Date()) {
  return Boolean(dateKey) && dateKey > toDateKey(today)
}
