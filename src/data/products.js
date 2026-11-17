import abcJuice from '../assets/images/P01-S02.abcjuice.jpg'
import ccaJuice from '../assets/images/P01-S02.ccajuice.jpg'
import greenBlend from '../assets/images/P01-S02.greenblend.jpg'
import appleChips from '../assets/images/P01-S02.Apple_rings2.jpg'
import carrotChips from '../assets/images/P01-S02.Carrot_chips.jpg'
import sweetPotatoChips from '../assets/images/P01-S02.sweetpotato.jpg'

// 상품 6개 (출처: PROJECT_CONTEXT.md 1. 상품) — 당근칩·고구마칩 추가 (답변 2026-11-16)
// description: 상품 상세 설명 (답변 2026-11-16)
// name: 포장지와 같은 영문 이름, nameKo: 아래에 작게 붙는 한글 이름 (답변 2026-11-16)
// howTo: 언제·어떻게 먹을지 (출처: 와이어프레임 P-03 루틴 결과, 답변 2026-11-13). ABC 주스 · 당근칩 · 고구마칩은 답변 2026-11-16
export const products = [
  {
    id: 'abc',
    name: 'ABC Juice',
    nameKo: 'ABC 주스',
    ingredients: '사과 · 비트 · 당근',
    volume: '300mL',
    price: '6,000원',
    unitPrice: 6000,
    image: abcJuice,
    description: '사과의 단맛에 비트와 당근을 더한 붉은 주스예요. 물이나 설탕 없이 재료만 갈아 담았어요.',
    howTo: '운동 전후에 한 잔',
  },
  {
    id: 'cca',
    name: 'CCA Juice',
    nameKo: 'CCA 주스',
    ingredients: '당근 · 양배추 · 사과',
    volume: '300mL',
    price: '6,000원',
    unitPrice: 6000,
    image: ccaJuice,
    description: '당근과 양배추에 사과를 더해 부드럽게 마시기 좋아요. 아침을 가볍게 시작하는 한 잔이에요.',
    howTo: '출근 전 아침에 한 잔',
  },
  {
    id: 'green',
    name: 'Green Blend',
    nameKo: '그린 블렌드',
    ingredients: '셀러리 · 양배추 · 케일 · 레몬',
    volume: '300mL',
    price: '6,500원',
    unitPrice: 6500,
    image: greenBlend,
    description: '셀러리, 양배추, 케일에 레몬을 더해 산뜻하게 맞췄어요. 초록 채소를 한 잔에 담았어요.',
    howTo: '점심과 함께 한 잔',
  },
  {
    id: 'chip',
    name: 'Apple Rings',
    nameKo: '사과링',
    ingredients: '사과',
    volume: '20g',
    price: '4,500원',
    unitPrice: 4500,
    image: appleChips,
    description: '얇게 썬 사과를 그대로 말려 바삭하게 만들었어요. 사과 하나만 들어갔어요.',
    howTo: '출출한 오후에 한 봉',
  },
  {
    id: 'carrot',
    name: 'Carrot Chips',
    nameKo: '당근칩',
    ingredients: '당근',
    volume: '20g',
    price: '5,000원',
    unitPrice: 5000,
    image: carrotChips,
    description: '당근을 얇게 썰어 말린 바삭한 칩이에요. 당근 본연의 단맛을 그대로 살렸어요.',
    howTo: '야식 대신 가볍게 한 봉',
  },
  {
    id: 'sweetpotato',
    name: 'Sweet Potato Chips',
    nameKo: '고구마칩',
    ingredients: '고구마',
    volume: '20g',
    price: '5,000원',
    unitPrice: 5000,
    image: sweetPotatoChips,
    description: '고구마를 얇게 썰어 말려 고소하고 든든해요. 고구마 하나만 들어갔어요.',
    howTo: '운동 후 든든하게 한 봉',
  },
]

// 홈 상품 섹션(P01-S02)에는 처음 4개만, 6개 전체는 '상품 더보기' 페이지에서 (답변 2026-11-16)
export const homeProducts = products.slice(0, 4)
