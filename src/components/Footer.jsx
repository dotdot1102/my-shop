import './Footer.css'

// 사업자 정보 — 수업용 가상 정보 (답변 2026-11-16)
// 이름은 가상, 번호는 의미 없는 예시 숫자 (답변 2026-11-16)
const BUSINESS_INFO = [
  { label: '상호명', value: '그린이슈' },
  { label: '대표자', value: '한초록' },
  { label: '주소', value: '서울특별시 성동구 초록숲길 12, 2층' },
  { label: '대표전화', value: '02-123-4567' },
  { label: '사업자등록번호', value: '123-45-67890' },
]

// 이용약관 · 이용안내 · 개인정보처리방침 — 페이지가 없어 글자로만 보여 줌
const POLICY_LINKS = ['이용약관', '이용안내', '개인정보처리방침']

// 공통 푸터
function Footer() {
  return (
    <footer className="footer">
      <p className="footer-wordmark" lang="en">
        Green Issue
      </p>
      <div className="container footer-inner">
        <div className="footer-row">
          <div className="footer-sns">
            <p className="footer-label">SNS</p>
            {/* 인스타그램 로고만, 링크 없음 (확정, 답변 2026-11-17) */}
            <ul className="footer-sns-list">
              <li>
                <span className="footer-sns-icon" role="img" aria-label="Instagram">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.6" />
                    <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.6" />
                    <circle cx="17.3" cy="6.7" r="1.1" fill="currentColor" />
                  </svg>
                </span>
              </li>
            </ul>
          </div>
          <p className="footer-note">이 페이지는 수업용 가상페이지 입니다.</p>
        </div>

        {/* 약관 · 사업자 정보 · 저작권 (답변 2026-11-16) */}
        <div className="footer-info">
          <ul className="footer-policy">
            {POLICY_LINKS.map((label) => (
              <li key={label}>{label}</li>
            ))}
          </ul>
          <ul className="footer-business">
            {BUSINESS_INFO.map(({ label, value }) => (
              <li key={label}>
                <span className="footer-business-label">{label}</span> {value}
              </li>
            ))}
          </ul>
          <p className="footer-copy">
            Copyright(c) 2026 그린이슈 All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
