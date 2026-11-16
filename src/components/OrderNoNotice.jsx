import { Link } from 'react-router-dom'

// 완료 화면의 주문번호 + 비회원 조회 안내 (답변 2026-11-16)
// 스타일은 pages/Subscribe.css의 .complete-no
function OrderNoNotice({ no, guest }) {
  return (
    <div className="complete-no">
      <p>
        <span className="muted">주문번호</span> <strong>{no}</strong>
      </p>
      {guest && (
        <p className="complete-no-note">
          주문번호와 주문 비밀번호로 주문을 조회할 수 있어요.{' '}
          <Link to="/order-lookup" state={{ no }} className="text-link">
            주문 조회하기
          </Link>
        </p>
      )}
    </div>
  )
}

export default OrderNoNotice
