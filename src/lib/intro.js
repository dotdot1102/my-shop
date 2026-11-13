// 첫 화면(인트로)을 보여 줄지 — 처음 방문 + 홈(/)으로 들어옴 + '동작 줄이기' 아님 (답변 2026-11-13)
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
export function shouldShowIntro() {
  if (typeof window === 'undefined') return false
  if (window.location.pathname !== '/') return false
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  return !hasSeenIntro()
}
