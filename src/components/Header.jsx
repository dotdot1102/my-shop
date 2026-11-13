import { Link, NavLink } from 'react-router-dom'
import './Header.css'

// 공통 메뉴 M-01 ~ M-04
function Header() {
  return (
    <header className="header">
      <nav className="header-nav container" aria-label="주 메뉴">
        <Link to="/" id="M-01" className="header-logo" aria-label="그린이슈 홈">
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
            <circle cx="13" cy="13" r="12" stroke="currentColor" strokeWidth="1.4" />
            <path d="M13 21V10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            <path
              d="M13 13c0-3.6 2.6-6 6-6 0 3.6-2.6 6-6 6Z"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
          </svg>
          <span lang="en">Green Issue</span>
        </Link>
        <div className="header-menu">
          <NavLink to="/routine" id="M-02" className="menu-link">
            루틴 만들기
          </NavLink>
          <NavLink to="/subscribe" id="M-03" className="menu-link">
            정기배송 신청
          </NavLink>
          <NavLink to="/join" id="M-04" className="btn btn-secondary header-btn">
            가입 · 로그인
          </NavLink>
        </div>
      </nav>
    </header>
  )
}

export default Header
