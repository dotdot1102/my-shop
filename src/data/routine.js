import { products } from './products.js'

// 루틴 만들기 결과 — 생활 패턴과 출근 시간에 따라 달라짐 (답변 2026-11-16)
// - 생활 패턴마다 상품 2~4개
// - 첫 상품 시각: 출근·등교는 고른 시간 30분 전, 재택·유연한 일정은 고른 시간 그대로
// - 나머지 상품은 정해진 시각
const byId = Object.fromEntries(products.map((p) => [p.id, p]))

// 출근 시간 (슬라이더 0~4)
export const TICKS = ['06:00', '07:00', '08:00', '09:00', '10:00']
export const TICK_SPOKEN = ['오전 6시', '오전 7시', '오전 8시', '오전 9시', '오전 10시']

// 생활 패턴 (칩 0~3)
export const CHIPS = ['주 5일 출근', '주로 재택', '유연한 일정', '등교·통학']

// startOffset: 첫 상품을 고른 시간보다 몇 분 앞에 둘지
const PATTERNS = [
  {
    startOffset: -30,
    items: [
      {
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
    ],
  },
  {
    startOffset: 0,
    items: [
      {
        product: byId.abc,
        title: '일 시작 전, ABC 주스 한 잔',
        body: '책상에 앉기 전 한 잔으로 하루를 열어요.',
        weeklyQty: 5,
        unit: '병',
      },
      {
        time: '21:00',
        product: byId.carrot,
        title: '야식 대신, 당근칩 한 봉',
        body: '늦은 저녁 출출할 때 가볍게 채워요.',
        weeklyQty: 5,
        unit: '봉',
      },
    ],
  },
  {
    startOffset: 0,
    items: [
      {
        product: byId.green,
        title: '하루를 여는 그린 블렌드 한 잔',
        body: '일정이 달라도 첫 한 잔은 같게 시작해요.',
        weeklyQty: 4,
        unit: '병',
      },
      {
        time: '13:00',
        product: byId.cca,
        title: '점심 무렵, CCA 주스 한 잔',
        body: '바쁜 날엔 식사 사이에 한 잔 챙겨요.',
        weeklyQty: 4,
        unit: '병',
      },
      {
        time: '17:00',
        product: byId.sweetpotato,
        title: '운동 후, 고구마칩 한 봉',
        body: '몸을 움직인 날 든든하게 채워요.',
        weeklyQty: 3,
        unit: '봉',
      },
      {
        time: '21:00',
        product: byId.carrot,
        title: '야식 대신, 당근칩 한 봉',
        body: '늦은 저녁 출출할 때 가볍게 채워요.',
        weeklyQty: 3,
        unit: '봉',
      },
    ],
  },
  {
    startOffset: -30,
    items: [
      {
        product: byId.abc,
        title: '등교 전, ABC 주스 한 잔',
        body: '아침을 거르기 쉬운 날에도 한 잔은 챙겨요.',
        weeklyQty: 5,
        unit: '병',
      },
      {
        time: '16:00',
        product: byId.chip,
        title: '하교 길, 사과칩 한 봉',
        body: '수업 끝나고 출출할 때 바삭하게 즐겨요.',
        weeklyQty: 5,
        unit: '봉',
      },
      {
        time: '19:00',
        product: byId.sweetpotato,
        title: '학원·운동 후, 고구마칩 한 봉',
        body: '저녁 일정 사이 든든하게 채워요.',
        weeklyQty: 5,
        unit: '봉',
      },
    ],
  },
]

function shiftTime(hhmm, minutes) {
  const [h, m] = hhmm.split(':').map(Number)
  const total = h * 60 + m + minutes
  const pad = (n) => String(n).padStart(2, '0')
  return `${pad(Math.floor(total / 60))}:${pad(total % 60)}`
}

// 고른 출근 시간(tick)·생활 패턴(chip)에 맞는 루틴 — 첫 상품 시각을 채워서 돌려줌
export function buildRoutine(tick, chip) {
  const pattern = PATTERNS[chip] ?? PATTERNS[0]
  const start = shiftTime(TICKS[tick] ?? TICKS[2], pattern.startOffset)
  return pattern.items.map((item, i) => (i === 0 ? { ...item, time: start } : item))
}

// 하루에 몇 번 — 결과 제목용
export const COUNT_WORDS = ['', '한', '두', '세', '네']
