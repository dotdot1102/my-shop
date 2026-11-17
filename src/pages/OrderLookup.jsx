import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { RequiredMark } from '../components/ContactFields.jsx'
import { formatWon } from '../lib/pricing.js'
import {
  cancelGuestOrder,
  findGuestOrder,
  ORDER_STATUS,
  updateGuestSubscription,
} from '../lib/storage.js'
import SubscriptionEditor from '../components/SubscriptionEditor.jsx'
import DeliveryLine from '../components/DeliveryLine.jsx'
import './OrderLookup.css'

// 비회원 주문 조회 (답변 2026-11-16)
// - 주문번호 + 주문 비밀번호(숫자 4자리)로 1회 주문 · 정기배송 신청을 조회
// - 1회 주문은 '주문 취소', 정기배송은 '정기배송 해지' (확인 한 번 거침)
// - 서버가 없어 주문한 브라우저에서만 조회됨
const KIND_LABEL = { order: '1회 주문', subscription: '정기배송' }

function formatDate(iso) {
  const d = new Date(iso)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

function OrderLookup() {
  const location = useLocation()
  const [no, setNo] = useState(location.state?.no ?? '')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [record, setRecord] = useState(null)
  // 조회에 쓴 비밀번호 — 취소할 때 다시 확인
  const [checkedPassword, setCheckedPassword] = useState('')
  // 정기배송 구성 변경 열림 (답변 2026-11-17)
  const [editing, setEditing] = useState(false)

  async function handleLookup(event) {
    event.preventDefault()
    const next = {}
    if (!no.trim()) next.no = '주문번호를 입력해 주세요.'
    if (!password) next.password = '주문 비밀번호를 입력해 주세요.'
    else if (!/^\d{4}$/.test(password)) next.password = '주문 비밀번호를 숫자 4자리로 입력해 주세요.'
    setErrors(next)
    setRecord(null)
    setEditing(false)
    if (Object.keys(next).length > 0) {
      document.getElementById(next.no ? 'lk-no' : 'lk-password')?.focus()
      return
    }
    const found = await findGuestOrder(no, password)
    if (!found) {
      setErrors({ form: '주문번호 또는 주문 비밀번호가 맞지 않아요.' })
      return
    }
    setRecord(found)
    setCheckedPassword(password)
  }

  async function handleCancel() {
    const isOrder = record.kind === 'order'
    const question = isOrder ? '정말 이 주문을 취소할까요?' : '정말 정기배송을 해지할까요?'
    if (!window.confirm(question)) return
    const updated = await cancelGuestOrder(record.no, checkedPassword)
    if (updated) setRecord(updated)
  }

  async function handleSave(changes) {
    const updated = await updateGuestSubscription(record.no, checkedPassword, changes)
    if (updated) setRecord(updated)
    setEditing(false)
  }

  const canCancel = record && (record.status === 'received' || record.status === 'active')
  const recipient = record?.recipient ?? {}

  return (
    <div className="band-white">
      <main className="container subscribe lookup">
        <h1 className="page-title subscribe-title">비회원 주문 조회</h1>

        <form className="lookup-form" onSubmit={handleLookup} noValidate>
          <p className="req-note">
            <RequiredMark /> 표시는 꼭 입력해 주세요.
          </p>
          <div className="field">
            <label htmlFor="lk-no">
              주문번호
              <RequiredMark />
            </label>
            <input
              className={errors.no ? 'input is-error' : 'input'}
              id="lk-no"
              type="text"
              placeholder="GI-20261116-0000"
              autoComplete="off"
              value={no}
              onChange={(e) => {
                setNo(e.target.value)
                setErrors((er) => ({ ...er, no: undefined, form: undefined }))
              }}
              aria-required="true"
              aria-invalid={Boolean(errors.no)}
              aria-describedby={errors.no ? 'lk-no-error' : undefined}
            />
            {errors.no && (
              <p id="lk-no-error" className="field-error">
                {errors.no}
              </p>
            )}
          </div>
          <div className="field">
            <label htmlFor="lk-password">
              주문 비밀번호
              <RequiredMark />
            </label>
            <input
              className={errors.password ? 'input is-error' : 'input'}
              id="lk-password"
              type="password"
              inputMode="numeric"
              autoComplete="off"
              maxLength={4}
              placeholder="숫자 4자리"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value.replace(/\D/g, ''))
                setErrors((er) => ({ ...er, password: undefined, form: undefined }))
              }}
              aria-required="true"
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? 'lk-password-error' : undefined}
            />
            {errors.password && (
              <p id="lk-password-error" className="field-error">
                {errors.password}
              </p>
            )}
          </div>
          {errors.form && (
            <p className="field-error" role="alert">
              {errors.form}
            </p>
          )}
          <button type="submit" className="btn btn-primary btn-block">
            조회하기
          </button>
          <p className="lookup-note">
            주문한 브라우저에서만 조회할 수 있어요. 회원은{' '}
            <Link to="/join" className="text-link">
              로그인
            </Link>
            해 주세요.
          </p>
        </form>

        {record && (
          <section className="lookup-result" aria-labelledby="lookup-result-title" aria-live="polite">
            <div className="lookup-head">
              <h2 id="lookup-result-title" className="lookup-no">
                {record.no}
              </h2>
              <span className={canCancel ? 'tag tag-brand' : 'tag'}>
                {ORDER_STATUS[record.status] ?? record.status}
              </span>
            </div>

            <dl className="detail-spec lookup-spec">
              <div>
                <dt>종류</dt>
                <dd>{KIND_LABEL[record.kind]}</dd>
              </div>
              <div>
                <dt>주문 날짜</dt>
                <dd>{formatDate(record.at)}</dd>
              </div>
              <div>
                <dt>상품</dt>
                <dd>
                  {(record.items ?? []).map((it) => (
                    <span key={it.id} className="lookup-line">
                      {it.name} × {it.qty}
                    </span>
                  ))}
                  {record.freeItem && (
                    <span className="lookup-line muted">
                      가입 무료 단품 · {record.freeItem.name} × 1
                    </span>
                  )}
                </dd>
              </div>
              {record.kind === 'subscription' && (
                <div>
                  <dt>배송 요일</dt>
                  <DeliveryLine record={record} as="dd" />
                </div>
              )}
              <div>
                <dt>{record.kind === 'order' ? '결제 금액' : '1회 배송 금액'}</dt>
                <dd className="detail-price">{formatWon(record.price?.total ?? 0)}</dd>
              </div>
              <div>
                <dt>결제 방식</dt>
                <dd>{record.payMethod}</dd>
              </div>
              <div>
                <dt>받는 분</dt>
                <dd>
                  {recipient.name} · {recipient.phone}
                </dd>
              </div>
              <div>
                <dt>배송지</dt>
                <dd>
                  {recipient.address}
                  {recipient.addressDetail && ` ${recipient.addressDetail}`}
                </dd>
              </div>
            </dl>

            {canCancel && !editing && (
              <div className="lookup-btns">
                {record.kind === 'subscription' && (
                  <button type="button" className="btn btn-secondary" onClick={() => setEditing(true)}>
                    구성 변경
                  </button>
                )}
                <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                  {record.kind === 'order' ? '주문 취소' : '정기배송 해지'}
                </button>
              </div>
            )}
            {editing && (
              <SubscriptionEditor
                record={record}
                onCancel={() => setEditing(false)}
                onSave={handleSave}
              />
            )}
          </section>
        )}
      </main>
    </div>
  )
}

export default OrderLookup
