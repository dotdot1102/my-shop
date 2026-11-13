import './Footer.css'

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
            {/* 인스타그램 로고만 (링크 주소는 미정 — 정해지면 <a>로 감쌈) */}
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
          <p className="footer-note">상품 가격은 시세를 참고한 예시입니다.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
