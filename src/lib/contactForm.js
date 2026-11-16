// 정기배송 신청 · 주문하기 공통 입력 칸과 확인 규칙 (답변 2026-11-16)
// - 이름 · 전화번호 · 배송지는 필수, 상세주소는 선택
// - 전화번호는 숫자 10~11자리(0으로 시작), 하이픈은 있어도 되고 없어도 됨
// - 주문 내용 확인 · 개인정보 수집·이용 · 결제 동의 체크 필수
export const CONTACT_FIELDS = [
  { id: 'name', label: '이름', type: 'text', autoComplete: 'name', required: true },
  {
    id: 'phone',
    label: '전화번호',
    type: 'tel',
    autoComplete: 'tel',
    inputMode: 'numeric',
    placeholder: '010-0000-0000',
    required: true,
  },
  {
    id: 'address',
    label: '배송지',
    type: 'text',
    autoComplete: 'address-line1',
    required: true,
  },
  {
    id: 'addressDetail',
    label: '상세주소',
    type: 'text',
    autoComplete: 'address-line2',
    placeholder: '동·호수 등',
    required: false,
  },
]

export const EMPTY_CONTACT = {
  name: '',
  phone: '',
  address: '',
  addressDetail: '',
  orderPassword: '',
}

// 비회원 주문 비밀번호 — 숫자 4자리, 주문 조회·취소에 씀 (답변 2026-11-16)
const ORDER_PASSWORD_PATTERN = /^\d{4}$/

export function checkOrderPassword(value) {
  if (!value) return '주문 비밀번호를 입력해 주세요.'
  if (!ORDER_PASSWORD_PATTERN.test(value)) return '주문 비밀번호를 숫자 4자리로 입력해 주세요.'
  return undefined
}

// 저장할 받는 분 정보 (주문 비밀번호는 빼고)
export function pickRecipient(form) {
  return {
    name: form.name,
    phone: form.phone,
    address: form.address,
    addressDetail: form.addressDetail,
  }
}

const PHONE_PATTERN = /^0\d{9,10}$/

// 칸 하나 확인 — 오류 문구 또는 undefined
export function checkContactField(id, value) {
  const text = value.trim()
  if (id === 'name' && !text) return '이름을 입력해 주세요.'
  if (id === 'phone') {
    if (!text) return '전화번호를 입력해 주세요.'
    if (!PHONE_PATTERN.test(text.replace(/[\s-]/g, ''))) {
      return '전화번호를 숫자 10~11자리로 입력해 주세요.'
    }
  }
  if (id === 'address' && !text) return '배송지를 입력해 주세요.'
  return undefined
}

// 전체 확인 — { 칸 id: 오류 문구, orderPassword, agree }
// guest: 비회원이면 주문 비밀번호도 확인
export function validateContact(form, agree, guest = false) {
  const errors = {}
  for (const field of CONTACT_FIELDS) {
    const error = checkContactField(field.id, form[field.id])
    if (error) errors[field.id] = error
  }
  if (guest) {
    const error = checkOrderPassword(form.orderPassword)
    if (error) errors.orderPassword = error
  }
  if (!agree) errors.agree = '주문 동의에 체크해 주세요.'
  return errors
}

// 첫 오류 칸으로 이동 (입력 칸 → 주문 비밀번호 → 동의 체크 순서)
export function focusFirstError(prefix, errors, agreeId) {
  const first = CONTACT_FIELDS.find((f) => errors[f.id])
  if (first) document.getElementById(`${prefix}-${first.id}`)?.focus()
  else if (errors.orderPassword) document.getElementById(`${prefix}-orderPassword`)?.focus()
  else if (errors.agree) document.getElementById(agreeId)?.focus()
}

export const AGREE_TEXT = '주문 내용을 확인했고, 개인정보 수집·이용과 결제 진행에 동의합니다'
