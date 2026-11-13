import { useLocation, useNavigate } from 'react-router-dom'
import { signIn } from '../lib/storage.js'
import './Join.css'

// P-02 회원가입·로그인
function Join() {
  const navigate = useNavigate()
  const location = useLocation()

  // P-03에서 왔으면 P-03으로, 아니면 P-01로 돌아감
  const returnTo = location.state?.from === '/routine' ? '/routine' : '/'

  function handleSubmit(method) {
    return (event) => {
      event.preventDefault()
      signIn(method)
      navigate(returnTo, { replace: true })
    }
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
          <form className="join-form" onSubmit={handleSubmit('join')}>
            <h1 id="join-title" className="join-title">
              회원가입
            </h1>
            <div className="field">
              <label htmlFor="j1">
                입력 항목 1 <span>· 추후 결정</span>
              </label>
              <input className="input" id="j1" type="text" />
            </div>
            <div className="field">
              <label htmlFor="j2">
                입력 항목 2 <span>· 추후 결정</span>
              </label>
              <input className="input" id="j2" type="text" />
            </div>
            <div className="field">
              <label htmlFor="j3">
                입력 항목 3 <span>· 추후 결정</span>
              </label>
              <input className="input" id="j3" type="text" />
            </div>
            <label htmlFor="j4" className="join-check">
              <input id="j4" type="checkbox" />
              <span>
                동의 항목 <span className="muted">· 추후 결정</span>
              </span>
            </label>
            <button type="submit" id="P02-B01" className="btn btn-primary btn-block join-submit">
              가입하기
            </button>
            <p className="join-note">가입 후 가려던 페이지로 돌아가요.</p>
          </form>
        </section>

        {/* P02-S03 로그인 */}
        <section id="P02-S03" className="join-login" aria-labelledby="login-title">
          <form className="join-form login-form" onSubmit={handleSubmit('login')}>
            <p id="login-title" className="login-title">
              이미 회원이신가요? 로그인
            </p>
            <div className="field">
              <label htmlFor="l1">
                로그인 입력 1 <span>· 로그인 방식 추후 결정</span>
              </label>
              <input className="input" id="l1" type="text" />
            </div>
            <div className="field">
              <label htmlFor="l2">
                로그인 입력 2 <span>· 로그인 방식 추후 결정</span>
              </label>
              <input className="input" id="l2" type="password" />
            </div>
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
