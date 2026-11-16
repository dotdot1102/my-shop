// 첫 화면(인트로)을 보여 줄지 — 홈(/)으로 들어옴 + '동작 줄이기' 아님 (답변 2026-11-13)
// 본 기록(gi-intro-seen)은 남기지만, 보여 줄지 판단에는 쓰지 않음 (답변 2026-11-16)
const SEEN_KEY = 'gi-intro-seen'

export function hasSeenIntro() {
  try {
    return localStorage.getItem(SEEN_KEY) === '1'
  } catch {
    return false
  }
}

export function markIntroSeen() {
  try {
    localStorage.setItem(SEEN_KEY, '1')
  } catch {
    // 저장할 수 없는 환경에서는 무시
  }
}

// 앱을 처음 열 때 한 번만 판단 (페이지 이동 중에는 다시 뜨지 않음)
// 사이트를 열 때마다(새로 열기·새로고침) 보여 줌 — 본 적 있어도 다시 뜸 (답변 2026-11-16)
export function shouldShowIntro() {
  if (typeof window === 'undefined') return false
  // 홈 주소 = 배포 기본 경로(예: /my-shop/). 끝 슬래시 유무는 같게 봄
  const home = import.meta.env.BASE_URL.replace(/\/$/, '')
  const path = window.location.pathname.replace(/\/$/, '')
  if (path !== home) return false
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  return true
}
