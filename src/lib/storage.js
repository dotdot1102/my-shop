// 서버 없이 localStorage로 회원·루틴·정기배송 신청을 흉내 냄 (PROJECT_CONTEXT.md 8. 기술과 배포)
// 실제 회원 시스템이 아니라 데모용 — 비밀번호는 원문 대신 SHA-256 해시로만 저장
const KEYS = {
  accounts: 'gi-accounts',
  member: 'gi-member',
  routine: 'gi-routine',
  subscription: 'gi-subscription',
}

// 로그인·로그아웃을 화면(헤더 등)에 알리는 이벤트
export const MEMBER_EVENT = 'gi-member-change'

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

function remove(key) {
  try {
    localStorage.removeItem(key)
  } catch {
    // 무시
  }
}

async function hash(text) {
  const bytes = new TextEncoder().encode(text)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

function normalizeEmail(email) {
  return email.trim().toLowerCase()
}

function setMember(member) {
  if (member) write(KEYS.member, member)
  else remove(KEYS.member)
  window.dispatchEvent(new Event(MEMBER_EVENT))
}

export function getMember() {
  return read(KEYS.member)
}

export function isMember() {
  return getMember() !== null
}

// 회원가입: 같은 이메일이 있으면 실패
export async function signUp({ name, email, password }) {
  const accounts = read(KEYS.accounts) ?? []
  const key = normalizeEmail(email)
  if (accounts.some((a) => a.email === key)) {
    return { ok: false, reason: 'exists' }
  }
  accounts.push({ name: name.trim(), email: key, passwordHash: await hash(password) })
  write(KEYS.accounts, accounts)
  setMember({ name: name.trim(), email: key })
  return { ok: true }
}

// 로그인: 이메일 + 비밀번호
export async function logIn({ email, password }) {
  const accounts = read(KEYS.accounts) ?? []
  const key = normalizeEmail(email)
  const account = accounts.find((a) => a.email === key)
  if (!account || account.passwordHash !== (await hash(password))) {
    return { ok: false }
  }
  setMember({ name: account.name, email: account.email })
  return { ok: true }
}

export function logOut() {
  setMember(null)
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
