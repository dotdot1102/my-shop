import { useEffect, useRef, useState } from 'react'
import Folder from './Folder.jsx'
import { markIntroSeen } from '../lib/intro.js'
import introIngredients from '../assets/images/P01-S01.07.jpg'
import introCarrotChips from '../assets/images/P01-S02.Carrot_chips.jpg'
import introJuices from '../assets/images/P01-S0.Three_juice_bottles.jpg'
import './IntroGate.css'

// 첫 화면(인트로) — 답변 2026-11-13
// - 처음 방문할 때 한 번만, 홈(/)으로 들어왔을 때만, '동작 줄이기' 설정이면 보이지 않음
// - 유리 폴더(#5B7A3C)를 눌러 열고, 펼쳐진 사진 중 하나를 누르면 메인 홈으로
// - 안내 문구 없음, 작은 '건너뛰기' 버튼
const LEAVE_MS = 400

const ITEMS = [
  { image: introIngredients, alt: '사과, 레몬, 케일, 당근, 비트를 쌓아 올린 재료' },
  { image: introCarrotChips, alt: '그린이슈 당근칩 봉투' },
  { image: introJuices, alt: '그린이슈 ABC 주스, CCA 주스, 그린 블렌드' },
]

function IntroGate({ onDone }) {
  const [leaving, setLeaving] = useState(false)
  const leavingRef = useRef(false)

  // 첫 화면이 떠 있는 동안 뒤 페이지 스크롤 막기
  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [])

  function enter() {
    if (leavingRef.current) return
    leavingRef.current = true
    markIntroSeen()
    setLeaving(true)
    window.setTimeout(onDone, LEAVE_MS)
  }

  return (
    <div
      className={leaving ? 'intro is-leaving' : 'intro'}
      role="dialog"
      aria-modal="true"
      aria-label="그린이슈 첫 화면"
    >
      <div className="intro-stage">
        <Folder
          label="Green Issue"
          items={ITEMS}
          variant="glass"
          color="#5B7A3C"
          theme="light"
          size={1.6}
          draggable={false}
          zoomOnClick={false}
          closeOnOutsideClick={false}
          onItemClick={enter}
        />
      </div>
      <button type="button" className="intro-skip" onClick={enter}>
        건너뛰기
      </button>
    </div>
  )
}

export default IntroGate
