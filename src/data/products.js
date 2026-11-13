import abcJuice from '../assets/images/P01-S02.abcjuice.jpg'
import ccaJuice from '../assets/images/P01-S02.ccajuice.jpg'
import greenBlend from '../assets/images/P01-S02.greenblend.jpg'
import appleChips from '../assets/images/P01-S02.Apple.jpg'

// 상품 4개 (출처: PROJECT_CONTEXT.md 1. 상품) — 가격은 시세를 참고한 예시
export const products = [
  {
    id: 'abc',
    name: 'ABC 주스',
    ingredients: '사과 · 비트 · 당근',
    volume: '300mL',
    price: '6,000원',
    image: abcJuice,
  },
  {
    id: 'cca',
    name: 'CCA 주스',
    ingredients: '당근 · 양배추 · 사과',
    volume: '300mL',
    price: '6,000원',
    image: ccaJuice,
  },
  {
    id: 'green',
    name: '그린 블렌드',
    ingredients: '셀러리 · 양배추 · 케일 · 레몬',
    volume: '300mL',
    price: '6,500원',
    image: greenBlend,
  },
  {
    id: 'chip',
    name: '사과칩',
    ingredients: '사과',
    volume: '20g',
    price: '4,500원',
    image: appleChips,
  },
]
