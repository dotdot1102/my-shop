// 서버 없이 localStorage로 회원·루틴·정기배송 신청·1회 주문을 흉내 냄 (PROJECT_CONTEXT.md 8. 기술과 배포)
// 실제 회원 시스템이 아니라 데모용 — 비밀번호는 원문 대신 SHA-256 해시로만 저장
const KEYS = {
  accounts: 'gi-accounts',
  member: 'gi-member',
  routine: 'gi-routine',
  subscriptions: 'gi-subscriptions',
  orders: 'gi-orders',
  couponUsed: 'gi-coupon-used',
  cart: 'gi-cart',
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

// ===== 비밀번호 찾기 · 회원 정보 수정 · 탈퇴 (답변 2026-11-17) =====
function findAccount(accounts, name, email) {
  const key = normalizeEmail(email)
  return accounts.find((a) => a.email === key && a.name === name.trim())
}

// 비밀번호 찾기 1단계: 가입한 이름 + 이메일이 맞는지
export function checkAccountForReset({ name, email }) {
  return Boolean(findAccount(read(KEYS.accounts) ?? [], name, email))
}

// 비밀번호 찾기 2단계: 새 비밀번호로 바꿈 (이름 + 이메일을 다시 확인)
export async function resetPassword({ name, email, password }) {
  const accounts = read(KEYS.accounts) ?? []
  const account = findAccount(accounts, name, email)
  if (!account) return { ok: false }
  account.passwordHash = await hash(password)
  write(KEYS.accounts, accounts)
  return { ok: true }
}

// 회원 정보 수정: 이름 · 이메일 · 비밀번호(비우면 그대로)
// 이메일을 바꾸면 주문 · 정기배송 · 무료권 사용 기록도 새 이메일로 옮김
export async function updateProfile(member, { name, email, password }) {
  const accounts = read(KEYS.accounts) ?? []
  const account = accounts.find((a) => a.email === member?.email)
  if (!account) return { ok: false, reason: 'missing' }
  const nextEmail = normalizeEmail(email)
  if (nextEmail !== account.email && accounts.some((a) => a.email === nextEmail)) {
    return { ok: false, reason: 'exists' }
  }
  const prevEmail = account.email
  account.name = name.trim()
  account.email = nextEmail
  if (password) account.passwordHash = await hash(password)
  write(KEYS.accounts, accounts)
  if (nextEmail !== prevEmail) {
    for (const key of [KEYS.orders, KEYS.subscriptions]) {
      const list = read(key) ?? []
      write(
        key,
        list.map((r) => (r.memberEmail === prevEmail ? { ...r, memberEmail: nextEmail } : r)),
      )
    }
    const used = read(KEYS.couponUsed) ?? []
    if (used.includes(prevEmail)) {
      write(KEYS.couponUsed, used.map((e) => (e === prevEmail ? nextEmail : e)))
    }
  }
  setMember({ name: account.name, email: account.email })
  return { ok: true }
}

// 회원 탈퇴: 진행 중인 정기배송을 모두 해지됨으로 바꾸고 계정 삭제 후 로그아웃
export function withdraw(member) {
  if (!member) return
  const subs = read(KEYS.subscriptions) ?? []
  write(
    KEYS.subscriptions,
    subs.map((r) =>
      r.memberEmail === member.email && r.status === 'active' ? { ...r, status: 'ended' } : r,
    ),
  )
  const accounts = read(KEYS.accounts) ?? []
  write(
    KEYS.accounts,
    accounts.filter((a) => a.email !== member.email),
  )
  setMember(null)
}

export function loadRoutine() {
  return read(KEYS.routine)
}

export function saveRoutine(routine) {
  write(KEYS.routine, routine)
}

// ===== 주문 · 정기배송 기록 (답변 2026-11-16) =====
// - 1회 주문(gi-orders)과 정기배송 신청(gi-subscriptions)을 각각 목록으로 쌓음
// - 모두 주문번호(GI-날짜-숫자 4자리)가 생김
// - 비회원은 주문 비밀번호(숫자 4자리)를 해시로만 저장 → 주문번호 + 비밀번호로 조회·취소
// - 상태: 1회 주문 received(주문 접수) / canceled(취소됨), 정기배송 active(정기배송 중) / ended(해지됨)
export const ORDER_STATUS = {
  received: '주문 접수',
  canceled: '취소됨',
  active: '정기배송 중',
  ended: '해지됨',
}

function allRecords() {
  return [
    ...(read(KEYS.orders) ?? []).map((r) => ({ ...r, kind: 'order' })),
    ...(read(KEYS.subscriptions) ?? []).map((r) => ({ ...r, kind: 'subscription' })),
  ]
}

function makeOrderNo() {
  const now = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  const date = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`
  const used = new Set(allRecords().map((r) => r.no))
  let no
  do {
    no = `GI-${date}-${String(Math.floor(1000 + Math.random() * 9000))}`
  } while (used.has(no))
  return no
}

// 저장하고 주문번호를 돌려줌. password는 비회원일 때만 넘김
async function saveRecord(key, record, { member, password, status }) {
  const no = makeOrderNo()
  const list = read(key) ?? []
  list.push({
    ...record,
    no,
    status,
    memberEmail: member?.email ?? null,
    passwordHash: password ? await hash(`${no}:${password}`) : null,
    at: new Date().toISOString(),
  })
  write(key, list)
  return no
}

export function saveSubscription(subscription, options = {}) {
  return saveRecord(KEYS.subscriptions, subscription, { ...options, status: 'active' })
}

export function saveOrder(order, options = {}) {
  return saveRecord(KEYS.orders, order, { ...options, status: 'received' })
}

function normalizeOrderNo(no) {
  return no.trim().toUpperCase()
}

// 비회원 주문 조회 — 맞으면 기록(kind 포함), 아니면 null
export async function findGuestOrder(no, password) {
  const key = normalizeOrderNo(no)
  const record = allRecords().find((r) => r.no === key)
  if (!record || !record.passwordHash) return null
  if (record.passwordHash !== (await hash(`${key}:${password}`))) return null
  return record
}

// 1회 주문은 취소됨, 정기배송은 해지됨으로 바꾸고 바뀐 기록을 돌려줌
function closeRecord(record) {
  const key = record.kind === 'order' ? KEYS.orders : KEYS.subscriptions
  const nextStatus = record.kind === 'order' ? 'canceled' : 'ended'
  const list = read(key) ?? []
  write(
    key,
    list.map((r) => (r.no === record.no ? { ...r, status: nextStatus } : r)),
  )
  return { ...record, status: nextStatus }
}

// 비회원 주문 취소(1회 주문) · 해지(정기배송) — 바뀐 기록을 돌려줌
export async function cancelGuestOrder(no, password) {
  const record = await findGuestOrder(no, password)
  if (!record) return null
  return closeRecord(record)
}

// 마이페이지 — 회원의 1회 주문 · 정기배송 신청 (최근 순) (답변 2026-11-16)
export function listMemberRecords(member) {
  if (!member) return { orders: [], subscriptions: [] }
  const mine = allRecords()
    .filter((r) => r.no && r.memberEmail === member.email)
    .sort((a, b) => (a.at < b.at ? 1 : -1))
  return {
    orders: mine.filter((r) => r.kind === 'order'),
    subscriptions: mine.filter((r) => r.kind === 'subscription'),
  }
}

// 마이페이지에서 주문 취소 · 정기배송 해지 — 그 회원의 기록만
export function cancelMemberRecord(member, no) {
  const record = allRecords().find((r) => r.no === no && r.memberEmail === member?.email)
  if (!record || (record.status !== 'received' && record.status !== 'active')) return null
  return closeRecord(record)
}

// ===== 정기배송 구성 변경 (답변 2026-11-17) =====
// - 정기배송 중(active)인 신청만, 상품 · 수량 · 배송 요일을 바꿈
// - 신청 방식(tab)은 그대로 — 루틴 구성으로 시작했으면 루틴 혜택(배송비 매회 무료) 유지
// changes: { items, price, deliveryDay, firstDelivery }
function updateSubscriptionRecord(record, changes) {
  if (record.kind !== 'subscription' || record.status !== 'active') return null
  const list = read(KEYS.subscriptions) ?? []
  const updated = { ...record, ...changes, changedAt: new Date().toISOString() }
  write(
    KEYS.subscriptions,
    list.map((r) => (r.no === record.no ? { ...r, ...changes, changedAt: updated.changedAt } : r)),
  )
  return updated
}

// 마이페이지 — 그 회원의 정기배송만
export function updateMemberSubscription(member, no, changes) {
  const record = allRecords().find((r) => r.no === no && r.memberEmail === member?.email)
  if (!record) return null
  return updateSubscriptionRecord(record, changes)
}

// 비회원 주문 조회 — 주문번호 + 주문 비밀번호가 맞을 때만
export async function updateGuestSubscription(no, password, changes) {
  const record = await findGuestOrder(no, password)
  if (!record) return null
  return updateSubscriptionRecord(record, changes)
}

// 가입 혜택 '단품 1회 무료권' — 회원마다 한 번, 1회 주문에서 씀 (답변 2026-11-16)
export function hasFreeCoupon(member) {
  if (!member) return false
  const used = read(KEYS.couponUsed) ?? []
  return !used.includes(member.email)
}

export function spendFreeCoupon(member) {
  if (!member) return
  const used = read(KEYS.couponUsed) ?? []
  if (!used.includes(member.email)) write(KEYS.couponUsed, [...used, member.email])
}

// 장바구니 — 비회원도 사용, 이 브라우저에 저장 (답변 2026-11-16)
// 형태: [{ id: 상품 id, qty: 수량 }]
export const CART_EVENT = 'gi-cart-change'

export function loadCart() {
  const cart = read(KEYS.cart)
  return Array.isArray(cart) ? cart.filter((line) => line && line.qty > 0) : []
}

function writeCart(cart) {
  write(KEYS.cart, cart)
  window.dispatchEvent(new Event(CART_EVENT))
}

// 이미 담긴 상품이면 수량을 더함
export function addToCart(id, qty = 1) {
  const cart = loadCart()
  const line = cart.find((l) => l.id === id)
  writeCart(
    line ? cart.map((l) => (l.id === id ? { ...l, qty: l.qty + qty } : l)) : [...cart, { id, qty }],
  )
}

export function setCartQty(id, qty) {
  writeCart(loadCart().map((l) => (l.id === id ? { ...l, qty: Math.max(1, qty) } : l)))
}

export function removeFromCart(id) {
  writeCart(loadCart().filter((l) => l.id !== id))
}

export function clearCart() {
  writeCart([])
}
