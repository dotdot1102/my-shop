import { AGREE_TEXT, CONTACT_FIELDS } from '../lib/contactForm.js'

// 필수 칸 표시 '*' (화면 읽기 프로그램에는 aria-required로 알림, 답변 2026-11-16)
export function RequiredMark() {
  return (
    <span className="req" aria-hidden="true">
      {' '}
      *
    </span>
  )
}

// 이름 · 전화번호 · 배송지 · 상세주소 (+ 비회원이면 주문 비밀번호) — 정기배송 신청 · 주문하기 공통
// prefix: 칸 id 앞에 붙는 글자 (예: 'f' → f-name)
export function ContactFields({ prefix, form, errors, onChange, guest = false }) {
  return (
    <>
      <ContactInputs prefix={prefix} form={form} errors={errors} onChange={onChange} />
      {guest && (
        <OrderPasswordField
          id={`${prefix}-orderPassword`}
          value={form.orderPassword}
          error={errors.orderPassword}
          onChange={(v) => onChange('orderPassword', v)}
        />
      )}
    </>
  )
}

// 비회원 주문 비밀번호 — 숫자 4자리 (답변 2026-11-16)
function OrderPasswordField({ id, value, error, onChange }) {
  const describedBy = error ? `${id}-error` : `${id}-hint`
  return (
    <div className="field">
      <label htmlFor={id}>
        주문 비밀번호
        <RequiredMark />
      </label>
      <input
        className={error ? 'input is-error' : 'input'}
        id={id}
        type="password"
        inputMode="numeric"
        autoComplete="new-password"
        maxLength={4}
        placeholder="숫자 4자리"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, ''))}
        aria-required="true"
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
      />
      {error ? (
        <p id={`${id}-error`} className="field-error">
          {error}
        </p>
      ) : (
        <p id={`${id}-hint`} className="field-hint">
          비회원 주문 조회할 때 주문번호와 함께 필요해요.
        </p>
      )}
    </div>
  )
}

function ContactInputs({ prefix, form, errors, onChange }) {
  return CONTACT_FIELDS.map((field) => {
    const inputId = `${prefix}-${field.id}`
    const error = errors[field.id]
    return (
      <div key={field.id} className="field">
        <label htmlFor={inputId}>
          {field.label}
          {field.required ? <RequiredMark /> : <span> (선택)</span>}
        </label>
        <input
          className={error ? 'input is-error' : 'input'}
          id={inputId}
          type={field.type}
          inputMode={field.inputMode}
          autoComplete={field.autoComplete}
          placeholder={field.placeholder}
          value={form[field.id]}
          onChange={(e) => onChange(field.id, e.target.value)}
          aria-required={field.required}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : undefined}
        />
        {error && (
          <p id={`${inputId}-error`} className="field-error">
            {error}
          </p>
        )}
      </div>
    )
  })
}

// 주문 내용 확인 · 개인정보 · 결제 동의 (필수)
export function AgreeCheck({ id, checked, error, onChange }) {
  return (
    <div className="agree">
      <label htmlFor={id} className="agree-check">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          aria-required="true"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        <span>
          {AGREE_TEXT} <span className="muted">(필수)</span>
        </span>
      </label>
      {error && (
        <p id={`${id}-error`} className="field-error">
          {error}
        </p>
      )}
    </div>
  )
}
