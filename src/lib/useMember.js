import { useEffect, useState } from 'react'
import { getMember, MEMBER_EVENT } from './storage.js'

// 현재 로그인한 회원 (로그인·로그아웃하면 바로 갱신)
export function useMember() {
  const [member, setMember] = useState(getMember)

  useEffect(() => {
    const update = () => setMember(getMember())
    window.addEventListener(MEMBER_EVENT, update)
    window.addEventListener('storage', update)
    return () => {
      window.removeEventListener(MEMBER_EVENT, update)
      window.removeEventListener('storage', update)
    }
  }, [])

  return member
}
