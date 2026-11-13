import { products } from './products.js'

// 루틴 만들기 결과 — Figma 와이어프레임 P-03 '오전 8시 출근 · 주 5일 출근' 예시
// 와이어프레임의 당근주스 → CCA 주스, 케일주스 → 그린 블렌드 (답변 2026-11-13)
// 결과 산출 기준은 [미정]이라 선택과 관계없이 이 예시를 보여 줌
const byId = Object.fromEntries(products.map((p) => [p.id, p]))

export const routinePlan = [
  {
    time: '07:30',
    product: byId.cca,
    title: '출근 전, CCA 주스 한 잔',
    body: '아침 식사에 곁들여 가볍게 시작해요.',
    weeklyQty: 5,
    unit: '병',
  },
  {
    time: '12:30',
    product: byId.green,
    title: '점심과 함께, 그린 블렌드 한 잔',
    body: '점심 식사에 초록빛 루틴을 더해요.',
    weeklyQty: 5,
    unit: '병',
  },
  {
    time: '15:00',
    product: byId.chip,
    title: '출출한 오후, 사과칩 한 봉',
    body: '잠깐 쉬는 시간에 바삭하게 즐겨요.',
    weeklyQty: 5,
    unit: '봉',
  },
]
