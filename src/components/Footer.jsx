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
            <p className="footer-tbd">채널 · 링크 — 추후 결정</p>
          </div>
          <p className="footer-note">상품 가격은 시세를 참고한 예시입니다.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
