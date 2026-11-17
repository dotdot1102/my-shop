import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { checkAccountForReset, logIn, resetPassword, signUp } from '../lib/storage.js'
import {
  checkEmail,
  checkName,
  checkNewPassword,
  compact,
  PASSWORD_MIN,
} from '../lib/accountForm.js'
import { RequiredMark } from '../components/ContactFields.jsx'
import Field from '../components/AccountField.jsx'
import './Join.css'

// 가입 입력 항목: 이름 · 이메일 · 비밀번호 + 필수 동의 (답변 2026-11-13)
// 비밀번호 8자 이상 + 확인 칸 (답변 2026-11-16)
function validateJoin(form) {
  return compact({
    name: checkName(form.name),
    email: checkEmail(form.email),
    ...checkNewPassword(form.password, form.passwordConfirm),
    agree: form.agree ? undefined : '필수 동의 항목에 체크해 주세요.',
  })
}

// 로그인: 이메일 + 비밀번호 (답변 2026-11-13)
function validateLogin(form) {
  const errors = {}
  if (!form.email.trim()) errors.email = '이메일을 입력해 주세요.'
  if (!form.password) errors.password = '비밀번호를 입력해 주세요.'
  return errors
}

const EMPTY_RESET = { name: '', email: '', password: '', passwordConfirm: '' }

// P-02 회원가입·로그인
function Join() {
  const navigate = useNavigate()
  const location = useLocation()

  // P-03에서 왔으면 P-03으로, 아니면 P-01로 돌아감
  // 마이페이지에서 왔으면 마이페이지로 (답변 2026-11-16)
  const RETURN_PAGES = ['/routine', '/mypage']
  const returnTo = RETURN_PAGES.includes(location.state?.from) ? location.state.from : '/'

  const [join, setJoin] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
    agree: false,
  })
  const [joinErrors, setJoinErrors] = useState({})
  const [login, setLogin] = useState({ email: '', password: '' })
  const [loginErrors, setLoginErrors] = useState({})
  const [loginNotice, setLoginNotice] = useState('')

  // 비밀번호 찾기 (답변 2026-11-17) — 로그인 자리에서 바뀜
  // step: null(로그인) → 'check'(이름·이메일 확인) → 'set'(새 비밀번호)
  const [resetStep, setResetStep] = useState(null)
  const [reset, setReset] = useState(EMPTY_RESET)
  const [resetErrors, setResetErrors] = useState({})

  function changeJoin(key, value) {
    setJoin((f) => ({ ...f, [key]: value }))
    setJoinErrors((e) => ({ ...e, [key]: undefined }))
  }

  function changeLogin(key, value) {
    setLogin((f) => ({ ...f, [key]: value }))
    setLoginErrors((e) => ({ ...e, [key]: undefined, form: undefined }))
  }

  function changeReset(key, value) {
    setReset((f) => ({ ...f, [key]: value }))
    setResetErrors((e) => ({ ...e, [key]: undefined, form: undefined }))
  }

  function openReset() {
    setReset({ ...EMPTY_RESET, email: login.email })
    setResetErrors({})
    setLoginNotice('')
    setResetStep('check')
  }

  function closeReset() {
    setResetStep(null)
    setResetErrors({})
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

  function handleResetCheck(event) {
    event.preventDefault()
    const errors = compact({ name: checkName(reset.name), email: checkEmail(reset.email) })
    setResetErrors(errors)
    if (Object.keys(errors).length > 0) return
    if (!checkAccountForReset(reset)) {
      setResetErrors({ form: '이름 또는 이메일이 가입 정보와 맞지 않아요.' })
      return
    }
    setResetStep('set')
  }

  async function handleResetSave(event) {
    event.preventDefault()
    const errors = checkNewPassword(reset.password, reset.passwordConfirm)
    setResetErrors(errors)
    if (Object.keys(errors).length > 0) return
    const result = await resetPassword(reset)
    if (!result.ok) {
      setResetErrors({ form: '이름 또는 이메일이 가입 정보와 맞지 않아요.' })
      setResetStep('check')
      return
    }
    setLogin({ email: reset.email.trim(), password: '' })
    setLoginErrors({})
    setLoginNotice('비밀번호를 바꿨어요. 새 비밀번호로 로그인해 주세요.')
    closeReset()
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
            <p className="req-note">
              <RequiredMark /> 표시는 꼭 입력해 주세요.
            </p>
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
              hint={`${PASSWORD_MIN}자 이상으로 입력해 주세요.`}
            />
            <Field
              id="j-password-confirm"
              label="비밀번호 확인"
              type="password"
              autoComplete="new-password"
              value={join.passwordConfirm}
              error={joinErrors.passwordConfirm}
              onChange={(v) => changeJoin('passwordConfirm', v)}
            />
            <div className="join-agree">
              <label htmlFor="j-agree" className="join-check">
                <input
                  id="j-agree"
                  type="checkbox"
                  checked={join.agree}
                  onChange={(e) => changeJoin('agree', e.target.checked)}
                  aria-required="true"
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
          </form>
        </section>

        {/* P02-S03 로그인 — '비밀번호 찾기'를 누르면 같은 자리가 찾기 양식으로 바뀜 */}
        <section id="P02-S03" className="join-login" aria-labelledby="login-title">
          {resetStep === null && (
            <form className="join-form login-form" onSubmit={handleLogin} noValidate>
              <p id="login-title" className="login-title">
                이미 회원이신가요? 로그인
              </p>
              {loginNotice && (
                <p className="join-notice" role="status">
                  {loginNotice}
                </p>
              )}
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
              <p className="join-find">
                <button type="button" className="text-link join-link-btn" onClick={openReset}>
                  비밀번호 찾기
                </button>
              </p>
            </form>
          )}

          {resetStep === 'check' && (
            <form className="join-form login-form" onSubmit={handleResetCheck} noValidate>
              <p id="login-title" className="login-title">
                비밀번호 찾기
              </p>
              <p className="join-note">가입할 때 쓴 이름과 이메일을 입력해 주세요.</p>
              <Field
                id="r-name"
                label="이름"
                autoComplete="name"
                value={reset.name}
                error={resetErrors.name}
                onChange={(v) => changeReset('name', v)}
              />
              <Field
                id="r-email"
                label="이메일"
                type="email"
                autoComplete="email"
                value={reset.email}
                error={resetErrors.email}
                onChange={(v) => changeReset('email', v)}
              />
              {resetErrors.form && (
                <p className="field-error" role="alert">
                  {resetErrors.form}
                </p>
              )}
              <button type="submit" className="btn btn-secondary btn-block join-submit">
                확인
              </button>
              <p className="join-find">
                <button type="button" className="text-link join-link-btn" onClick={closeReset}>
                  로그인으로 돌아가기
                </button>
              </p>
            </form>
          )}

          {resetStep === 'set' && (
            <form className="join-form login-form" onSubmit={handleResetSave} noValidate>
              <p id="login-title" className="login-title">
                새 비밀번호 정하기
              </p>
              <p className="join-note">{reset.email.trim()} 계정의 새 비밀번호를 정해 주세요.</p>
              <Field
                id="r-password"
                label="새 비밀번호"
                type="password"
                autoComplete="new-password"
                value={reset.password}
                error={resetErrors.password}
                onChange={(v) => changeReset('password', v)}
                hint={`${PASSWORD_MIN}자 이상으로 입력해 주세요.`}
              />
              <Field
                id="r-password-confirm"
                label="새 비밀번호 확인"
                type="password"
                autoComplete="new-password"
                value={reset.passwordConfirm}
                error={resetErrors.passwordConfirm}
                onChange={(v) => changeReset('passwordConfirm', v)}
              />
              {resetErrors.form && (
                <p className="field-error" role="alert">
                  {resetErrors.form}
                </p>
              )}
              <button type="submit" className="btn btn-secondary btn-block join-submit">
                비밀번호 바꾸기
              </button>
              <p className="join-find">
                <button type="button" className="text-link join-link-btn" onClick={closeReset}>
                  로그인으로 돌아가기
                </button>
              </p>
            </form>
          )}

          {/* 비회원 주문 조회 (답변 2026-11-16) */}
          <p className="join-lookup">
            회원이 아니신가요?{' '}
            <Link to="/order-lookup" className="text-link">
              비회원 주문 조회
            </Link>
          </p>
        </section>
      </main>
    </div>
  )
}

export default Join
