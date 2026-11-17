// 회원가입 · 비밀번호 찾기 · 회원 정보 수정 공통 입력 규칙 (답변 2026-11-16, 2026-11-17)
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const PASSWORD_MIN = 8

export function checkName(name) {
  return name.trim() ? undefined : '이름을 입력해 주세요.'
}

export function checkEmail(email) {
  if (!email.trim()) return '이메일을 입력해 주세요.'
  if (!EMAIL_PATTERN.test(email.trim())) return '이메일 형식을 확인해 주세요.'
  return undefined
}

// 새 비밀번호 8자 이상 + 확인 칸 일치 — { password, passwordConfirm } 오류
export function checkNewPassword(password, passwordConfirm) {
  const errors = {}
  if (!password) errors.password = '비밀번호를 입력해 주세요.'
  else if (password.length < PASSWORD_MIN) {
    errors.password = `비밀번호를 ${PASSWORD_MIN}자 이상으로 입력해 주세요.`
  }
  if (!passwordConfirm) errors.passwordConfirm = '비밀번호를 한 번 더 입력해 주세요.'
  else if (password && passwordConfirm !== password) {
    errors.passwordConfirm = '비밀번호가 서로 달라요.'
  }
  return errors
}

// 오류 객체에서 undefined 값을 뺌
export function compact(errors) {
  return Object.fromEntries(Object.entries(errors).filter(([, v]) => v))
}
