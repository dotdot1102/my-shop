// 배송비 규칙 (PROJECT_CONTEXT.md 1. 정기배송·혜택·배송비 규칙, 답변 2026-11-13)
// - 루틴 구성: 배송비 매회 무료 (첫 회 배송 무료 = 배송비 무료, 상품 금액은 그대로)
// - 상품 직접 선택: 5만 원 이상 무료배송, 미만은 3,000원
export const FREE_SHIPPING_MIN = 50000
export const SHIPPING_FEE = 3000

export function formatWon(value) {
  return `${value.toLocaleString('ko-KR')}원`
}

export function calcPrice(lines, tab) {
  const subtotal = lines.reduce((sum, line) => sum + line.unitPrice * line.qty, 0)
  let shipping = 0
  if (tab === 'direct' && subtotal > 0 && subtotal < FREE_SHIPPING_MIN) {
    shipping = SHIPPING_FEE
  }
  return { subtotal, shipping, total: subtotal + shipping }
}
