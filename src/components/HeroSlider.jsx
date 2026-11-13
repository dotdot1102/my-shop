import { useEffect, useState } from 'react'
import heroMain from '../assets/images/P01-S01-main.jpg'
import heroBasket from '../assets/images/P01-S01.01.jpg'
import heroGlass from '../assets/images/P01-S01.06.jpg'
import heroIngredients from '../assets/images/P01-S01.04.jpg'
import './HeroSlider.css'

// P01-S01 첫 화면 이미지 슬라이드 (답변 2026-11-13)
// - 3장면, 0.4초 크로스페이드
// - 2초마다 자동으로 다음 장면 (마우스를 올리거나 키보드 포커스가 있으면 멈춤,
//   '동작 줄이기' 설정이면 자동 전환 없음)
// - 세로 사진 두 장은 한 장면에 나란히
// - 사진 위에는 글을 올리지 않고, 화살표·막대는 이미지 아래 바깥에 둠
const SLIDES = [
  [{ src: heroMain, alt: '그린이슈 주스 세 병과 당근칩, 사과링' }],
  [{ src: heroBasket, alt: '그린이슈 상품을 담은 흰 장바구니' }],
  [
    { src: heroGlass, alt: '재료와 주스를 반씩 담은 유리잔' },
    { src: heroIngredients, alt: '사과, 당근, 비트, 케일 같은 재료를 늘어놓은 모습' },
  ],
]

function Chevron({ direction }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d={direction === 'prev' ? 'M12.5 4.5 7 10l5.5 5.5' : 'M7.5 4.5 13 10l-5.5 5.5'}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const AUTO_INTERVAL = 2000

function HeroSlider() {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const count = SLIDES.length

  // 자동 전환 — index가 바뀌면(직접 넘겨도) 타이머를 처음부터 다시 셈
  useEffect(() => {
    if (paused) return undefined
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    const timer = window.setTimeout(() => {
      setIndex((current) => (current + 1) % count)
    }, AUTO_INTERVAL)
    return () => window.clearTimeout(timer)
  }, [index, paused, count])

  const goTo = (i) => setIndex(i)
  // 빠르게 연달아 눌러도 누른 만큼 넘어가도록 이전 값 기준으로 계산
  const step = (delta) => setIndex((current) => (current + delta + count) % count)

  return (
    <div
      className="hero-slider"
      role="region"
      aria-roledescription="carousel"
      aria-label="첫 화면 이미지"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setPaused(false)
      }}
    >
      <div className="hero-slides">
        {SLIDES.map((images, i) => (
          <div
            key={i}
            className={i === index ? 'hero-slide is-on' : 'hero-slide'}
            role="group"
            aria-roledescription="slide"
            aria-label={`${count}장 중 ${i + 1}번째`}
            aria-hidden={i !== index}
          >
            {images.map((img) => (
              <img key={img.src} src={img.src} alt={img.alt} />
            ))}
          </div>
        ))}
      </div>

      <div className="hero-controls">
        <button type="button" className="hero-arrow" aria-label="이전 이미지" onClick={() => step(-1)}>
          <Chevron direction="prev" />
        </button>
        <div className="hero-bars">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              className={i === index ? 'hero-bar is-on' : 'hero-bar'}
              aria-label={`${i + 1}번째 이미지 보기`}
              aria-current={i === index}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
        <button type="button" className="hero-arrow" aria-label="다음 이미지" onClick={() => step(1)}>
          <Chevron direction="next" />
        </button>
      </div>
    </div>
  )
}

export default HeroSlider
