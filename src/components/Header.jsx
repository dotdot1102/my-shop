import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useMember } from '../lib/useMember.js'
import { cartCount, useCart } from '../lib/useCart.js'
import './Header.css'

// 장바구니 아이콘 + 담은 개수 (PC·모바일 공통, 답변 2026-11-16)
function CartLink({ count, className }) {
  return (
    <NavLink
      to="/cart"
      className={className}
      aria-label={count > 0 ? `장바구니 ${count}개` : '장바구니'}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M5 8h14l-1.2 10.6a1.6 1.6 0 0 1-1.6 1.4H7.8a1.6 1.6 0 0 1-1.6-1.4L5 8Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          d="M9 10.5V7a3 3 0 0 1 6 0v3.5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
      {count > 0 && (
        <span className="header-cart-count" aria-hidden="true">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </NavLink>
  )
}

// 공통 메뉴 M-01 ~ M-04
function Header() {
  const member = useMember()
  const { pathname } = useLocation()
  const count = cartCount(useCart())

  // 모바일(화면 폭 768px 이하) 줄 세 개 메뉴 — 연 페이지 주소를 기억해서, 페이지를 옮기면 저절로 닫힘 (답변 2026-11-16)
  const [menuOpenAt, setMenuOpenAt] = useState(null)
  const menuOpen = menuOpenAt === pathname

  useEffect(() => {
    if (!menuOpen) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') setMenuOpenAt(null)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [menuOpen])

  return (
    <header className="header">
      <nav className="header-nav container" aria-label="주 메뉴">
        <Link to="/" id="M-01" className="header-logo" aria-label="그린이슈 홈">
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
            {/* 파비콘과 같은 모양 — 초록 원 + 흰 잎 (답변 2026-11-16) */}
            <circle cx="13" cy="13" r="13" fill="#5B7A3C" />
            <path d="M13 20.5V10.5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
            <path
              d="M13 13.5c0-3.6 2.6-6 6-6 0 3.6-2.6 6-6 6Z"
              stroke="#FFFFFF"
              strokeWidth="2"
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
          <CartLink count={count} className="header-cart" />
          {/* 로그인 상태면 마이페이지 — 로그아웃은 마이페이지 안에 (답변 2026-11-16) */}
          {member ? (
            <NavLink to="/mypage" id="M-04" className="btn btn-secondary header-btn">
              마이페이지
            </NavLink>
          ) : (
            <NavLink to="/join" id="M-04" className="btn btn-secondary header-btn">
              가입 · 로그인
            </NavLink>
          )}
        </div>

        {/* 모바일 전용 아이콘 (화면 폭 768px 이하에서만 보임, 답변 2026-11-16) */}
        <div className="header-mobile">
          <CartLink count={count} className="header-icon header-cart" />
          {/* 사람 아이콘 — 회원은 마이페이지, 비회원은 가입·로그인 (답변 2026-11-16) */}
          <NavLink
            to={member ? '/mypage' : '/join'}
            className="header-icon header-person"
            aria-label={member ? '마이페이지' : '가입 · 로그인'}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="8.5" r="3.8" stroke="currentColor" strokeWidth="1.6" />
              <path
                d="M4.5 20c.9-3.6 3.9-5.8 7.5-5.8s6.6 2.2 7.5 5.8"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </NavLink>
          <button
            type="button"
            className="header-icon"
            aria-label={menuOpen ? '메뉴 닫기' : '메뉴 열기'}
            aria-expanded={menuOpen}
            aria-controls="header-drawer"
            onClick={() => setMenuOpenAt(menuOpen ? null : pathname)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M4 7h16M4 12h16M4 17h16"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </nav>

      {/* 모바일 메뉴 — 상단 아래로 펼침, 항목을 누르거나 아이콘을 다시 누르면 닫힘 */}
      {menuOpen && (
        <div id="header-drawer" className="header-drawer">
          <NavLink
            to="/routine"
            className="header-drawer-link"
            onClick={() => setMenuOpenAt(null)}
          >
            루틴 만들기
          </NavLink>
          <NavLink
            to="/subscribe"
            className="header-drawer-link"
            onClick={() => setMenuOpenAt(null)}
          >
            정기배송 신청
          </NavLink>
        </div>
      )}
    </header>
  )
}

export default Header
