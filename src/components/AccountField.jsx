import { RequiredMark } from './ContactFields.jsx'

// 회원가입 · 로그인 · 비밀번호 찾기 · 회원 정보 수정 입력 칸
// 칸 이름 옆 '*' = 필수(required), hint = 칸 아래 안내 (답변 2026-11-16)
function AccountField({
  id,
  label,
  type = 'text',
  autoComplete,
  value,
  error,
  onChange,
  hint,
  required = true,
}) {
  const describedBy = [error && `${id}-error`, hint && `${id}-hint`].filter(Boolean).join(' ')
  return (
    <div className="field">
      <label htmlFor={id}>
        {label}
        {required && <RequiredMark />}
      </label>
      <input
        className={error ? 'input is-error' : 'input'}
        id={id}
        type={type}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-required={required ? 'true' : undefined}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy || undefined}
      />
      {hint && !error && (
        <p id={`${id}-hint`} className="field-hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="field-error">
          {error}
        </p>
      )}
    </div>
  )
}

export default AccountField
