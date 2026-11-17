import { useState } from 'react'
import Field from './AccountField.jsx'
import { checkEmail, checkName, checkNewPassword, compact, PASSWORD_MIN } from '../lib/accountForm.js'
import { updateProfile } from '../lib/storage.js'

// 회원 정보 수정 — 마이페이지 회원 정보 아래에 펼침 (답변 2026-11-17)
// - 이름 · 이메일 · 비밀번호를 바꿈. 새 비밀번호는 비우면 그대로
// - 다른 회원이 쓰는 이메일이면 저장 안 됨
function ProfileEditor({ member, onSaved, onCancel }) {
  const [form, setForm] = useState({
    name: member.name,
    email: member.email,
    password: '',
    passwordConfirm: '',
  })
  const [errors, setErrors] = useState({})

  function change(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((e) => ({ ...e, [key]: undefined, form: undefined }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const changingPassword = Boolean(form.password || form.passwordConfirm)
    const next = compact({
      name: checkName(form.name),
      email: checkEmail(form.email),
      ...(changingPassword ? checkNewPassword(form.password, form.passwordConfirm) : {}),
    })
    setErrors(next)
    if (Object.keys(next).length > 0) {
      const first = ['name', 'email', 'password', 'passwordConfirm'].find((k) => next[k])
      document.getElementById(`p-${first === 'passwordConfirm' ? 'password-confirm' : first}`)?.focus()
      return
    }
    const result = await updateProfile(member, {
      name: form.name,
      email: form.email,
      password: changingPassword ? form.password : '',
    })
    if (!result.ok) {
      setErrors(
        result.reason === 'exists'
          ? { email: '다른 회원이 쓰는 이메일이에요.' }
          : { form: '회원 정보를 찾을 수 없어요. 다시 로그인해 주세요.' },
      )
      return
    }
    onSaved()
  }

  return (
    <form className="my-edit" onSubmit={handleSubmit} noValidate aria-label="회원 정보 수정">
      <Field
        id="p-name"
        label="이름"
        autoComplete="name"
        value={form.name}
        error={errors.name}
        onChange={(v) => change('name', v)}
      />
      <Field
        id="p-email"
        label="이메일"
        type="email"
        autoComplete="email"
        value={form.email}
        error={errors.email}
        onChange={(v) => change('email', v)}
        hint="바꿔도 주문 내역과 정기배송은 그대로 보여요."
      />
      <Field
        id="p-password"
        label="새 비밀번호"
        type="password"
        autoComplete="new-password"
        value={form.password}
        error={errors.password}
        onChange={(v) => change('password', v)}
        hint={`바꿀 때만 입력해 주세요. ${PASSWORD_MIN}자 이상이에요.`}
        required={false}
      />
      <Field
        id="p-password-confirm"
        label="새 비밀번호 확인"
        type="password"
        autoComplete="new-password"
        value={form.passwordConfirm}
        error={errors.passwordConfirm}
        onChange={(v) => change('passwordConfirm', v)}
        required={false}
      />
      {errors.form && (
        <p className="field-error" role="alert">
          {errors.form}
        </p>
      )}
      <div className="my-edit-actions">
        <button type="button" className="btn btn-secondary my-logout" onClick={onCancel}>
          취소
        </button>
        <button type="submit" className="btn btn-primary my-logout">
          저장
        </button>
      </div>
    </form>
  )
}

export default ProfileEditor
