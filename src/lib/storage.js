// 서버 없이 localStorage로 회원·루틴·정기배송 신청을 흉내 냄 (PROJECT_CONTEXT.md 8. 기술과 배포)
const KEYS = {
  member: 'gi-member',
  routine: 'gi-routine',
  subscription: 'gi-subscription',
}

function read(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // 저장할 수 없는 환경(사생활 보호 모드 등)에서는 무시
  }
}

export function isMember() {
  return read(KEYS.member) !== null
}

export function signIn(method) {
  write(KEYS.member, { method, at: new Date().toISOString() })
}

export function loadRoutine() {
  return read(KEYS.routine)
}

export function saveRoutine(routine) {
  write(KEYS.routine, routine)
}

export function saveSubscription(subscription) {
  write(KEYS.subscription, { ...subscription, at: new Date().toISOString() })
}
