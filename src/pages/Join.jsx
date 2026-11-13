import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { logIn, signUp } from '../lib/storage.js'
import './Join.css'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// 가입 입력 항목: 이름 · 이메일 · 비밀번호 + 필수 동의 (답변 2026-11-13)
function validateJoin(form) {
  const errors = {}
  if (!form.name.trim()) errors.name = '이름을 입력해 주세요.'
  if (!form.email.trim()) errors.email = '이메일을 입력해 주세요.'
  else if (!EMAIL_PATTERN.test(form.email.trim())) errors.email = '이메일 형식을 확인해 주세요.'
  if (!form.password) errors.password = '비밀번호를 입력해 주세요.'
  if (!form.agree) errors.agree = '필수 동의 항목에 체크해 주세요.'
  return errors
}

// 로그인: 이메일 + 비밀번호 (답변 2026-11-13)
function validateLogin(form) {
  const errors = {}
  if (!form.email.trim()) errors.email = '이메일을 입력해 주세요.'
  if (!form.password) errors.password = '비밀번호를 입력해 주세요.'
  return errors
}

function Field({ id, label, type = 'text', autoComplete, value, error, onChange }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        className={error ? 'input is-error' : 'input'}
        id={id}
        type={type}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error && (
        <p id={`${id}-error`} className="field-error">
          {error}
        </p>
      )}
    </div>
  )
}

// P-02 회원가입·로그인
function Join() {
  const navigate = useNavigate()
  const location = useLocation()

  // P-03에서 왔으면 P-03으로, 아니면 P-01로 돌아감
  const returnTo = location.state?.from === '/routine' ? '/routine' : '/'

  const [join, setJoin] = useState({ name: '', email: '', password: '', agree: false })
  const [joinErrors, setJoinErrors] = useState({})
  const [login, setLogin] = useState({ email: '', password: '' })
  const [loginErrors, setLoginErrors] = useState({})

  function changeJoin(key, value) {
    setJoin((f) => ({ ...f, [key]: value }))
    setJoinErrors((e) => ({ ...e, [key]: undefined }))
  }

  function changeLogin(key, value) {
    setLogin((f) => ({ ...f, [key]: value }))
    setLoginErrors((e) => ({ ...e, [key]: undefined, form: undefined }))
  }

  async function handleJoin(event) {
    event.preventDefault()
    const errors = validateJoin(join)
    setJoinErrors(errors)
    if (Object.keys(errors).length > 0) return
    const result = await signUp(join)
    if (!result.ok) {
      setJoinErrors({ email: '이미 가입한 이메일이에요. 아래에서 로그인해 주세요.' })
      return
    }
    navigate(returnTo, { replace: true })
  }

  async function handleLogin(event) {
    event.preventDefault()
    const errors = validateLogin(login)
    setLoginErrors(errors)
    if (Object.keys(errors).length > 0) return
    const result = await logIn(login)
    if (!result.ok) {
      setLoginErrors({ form: '이메일 또는 비밀번호가 맞지 않아요.' })
      return
    }
    navigate(returnTo, { replace: true })
  }

  return (
    <div className="band-white">
      <main className="join">
        {/* P02-S01 혜택 한 줄 */}
        <section id="P02-S01" className="join-benefit" aria-label="가입 혜택">
          <p>
            가입하면 단품 1회 무료권을 드려요.
            <br />
            무료권을 쓴 주문은 배송비가 무료예요.
          </p>
        </section>

        {/* P02-S02 가입 양식 */}
        <section id="P02-S02" className="join-form-section" aria-labelledby="join-title">
          <form className="join-form" onSubmit={handleJoin} noValidate>
            <h1 id="join-title" className="join-title">
              회원가입
            </h1>
            <Field
              id="j-name"
              label="이름"
              autoComplete="name"
              value={join.name}
              error={joinErrors.name}
              onChange={(v) => changeJoin('name', v)}
            />
            <Field
              id="j-email"
              label="이메일"
              type="email"
              autoComplete="email"
              value={join.email}
              error={joinErrors.email}
              onChange={(v) => changeJoin('email', v)}
            />
            <Field
              id="j-password"
              label="비밀번호"
              type="password"
              autoComplete="new-password"
              value={join.password}
              error={joinErrors.password}
              onChange={(v) => changeJoin('password', v)}
            />
            <div className="join-agree">
              <label htmlFor="j-agree" className="join-check">
                <input
                  id="j-agree"
                  type="checkbox"
                  checked={join.agree}
                  onChange={(e) => changeJoin('agree', e.target.checked)}
                  aria-invalid={Boolean(joinErrors.agree)}
                />
                <span>
                  이용약관 및 개인정보 수집·이용에 동의합니다 <span className="muted">(필수)</span>
                </span>
              </label>
              {joinErrors.agree && <p className="field-error">{joinErrors.agree}</p>}
            </div>
            <button type="submit" id="P02-B01" className="btn btn-primary btn-block join-submit">
              가입하기
            </button>
            <p className="join-note">가입 후 가려던 페이지로 돌아가요.</p>
          </form>
        </section>

        {/* P02-S03 로그인 */}
        <section id="P02-S03" className="join-login" aria-labelledby="login-title">
          <form className="join-form login-form" onSubmit={handleLogin} noValidate>
            <p id="login-title" className="login-title">
              이미 회원이신가요? 로그인
            </p>
            <Field
              id="l-email"
              label="이메일"
              type="email"
              autoComplete="email"
              value={login.email}
              error={loginErrors.email}
              onChange={(v) => changeLogin('email', v)}
            />
            <Field
              id="l-password"
              label="비밀번호"
              type="password"
              autoComplete="current-password"
              value={login.password}
              error={loginErrors.password}
              onChange={(v) => changeLogin('password', v)}
            />
            {loginErrors.form && (
              <p className="field-error" role="alert">
                {loginErrors.form}
              </p>
            )}
            <button
              type="submit"
              id="P02-B02"
              className="btn btn-secondary btn-block join-submit"
            >
              로그인
            </button>
          </form>
        </section>
      </main>
    </div>
  )
}

export default Join
