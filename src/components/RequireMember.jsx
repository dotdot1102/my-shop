import { Navigate, useLocation } from 'react-router-dom'
import { isMember } from '../lib/storage.js'

// P03-S01: 비회원이 들어오면 P-02로 보내고, 가입·로그인 후 이 페이지로 돌아옴
function RequireMember({ children }) {
  const location = useLocation()
  if (!isMember()) {
    return <Navigate to="/join" replace state={{ from: location.pathname }} />
  }
  return children
}

export default RequireMember
