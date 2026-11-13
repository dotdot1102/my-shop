import { useState } from 'react'
import { Link } from 'react-router-dom'
import ArrowIcon from '../components/ArrowIcon.jsx'
import { loadRoutine, saveRoutine } from '../lib/storage.js'
import './Routine.css'

// 질문 항목은 [미정] — 시안의 자리 표시 그대로
const TICKS = [0, 1, 2, 3, 4]
const CHIPS = [0, 1, 2, 3]
const ROWS = [1, 2, 3]

// P-03 루틴 만들기
function Routine() {
  const saved = loadRoutine()
  const [tick, setTick] = useState(saved?.tick ?? 2)
  const [chip, setChip] = useState(saved?.chip ?? 0)
  // 선택이 바뀔 때마다 결과 영역을 다시 그려 0.2초 페이드
  const [version, setVersion] = useState(0)

  function update(next) {
    const routine = { tick, chip, ...next }
    setTick(routine.tick)
    setChip(routine.chip)
    setVersion((v) => v + 1)
    saveRoutine(routine)
  }

  return (
    <div className="band-white">
      <main className="container routine">
        {/* P03-S01 가입·로그인 확인 */}
        <section id="P03-S01" className="routine-head">
          <h1 className="page-title">내 루틴 만들기</h1>
        </section>

        {/* P03-S02 선택 영역 */}
        <section id="P03-S02" className="routine-pick" aria-label="루틴 선택">
          <div className="routine-question">
            <label htmlFor="commute" className="question">
              출근 시간은 언제인가요?
            </label>
            <input
              className="range"
              id="commute"
              type="range"
              min="0"
              max="4"
              step="1"
              value={tick}
              onChange={(e) => {
                const t = Number(e.target.value)
                if (t !== tick) update({ tick: t })
              }}
              aria-valuetext={`눈금 ${tick + 1}`}
            />
            <div className="ticks" aria-hidden="true">
              {TICKS.map((i) => (
                <span key={i} className={i === tick ? 'is-on' : undefined}>
                  눈금 {i + 1}
                </span>
              ))}
            </div>
            <p className="tbd">눈금 값 · 추후 결정</p>
          </div>

          <div className="routine-question">
            <p id="pattern-q" className="question">
              생활 패턴에 가까운 것을 골라 주세요
            </p>
            <div role="group" aria-labelledby="pattern-q" className="chips">
              {CHIPS.map((i) => (
                <button
                  key={i}
                  type="button"
                  className={i === chip ? 'chip is-on' : 'chip'}
                  aria-pressed={i === chip}
                  onClick={() => {
                    if (i !== chip) update({ chip: i })
                  }}
                >
                  생활 패턴 {i + 1} · 추후 결정
                </button>
              ))}
            </div>
            <p className="tbd">칩 4개 항목 · 추후 결정</p>
          </div>
        </section>

        {/* P03-S03 결과 영역 */}
        <section id="P03-S03" className="routine-result" aria-labelledby="result-title">
          <p className="result-note">선택을 바꾸면 결과가 바로 바뀌고 계정에 저장돼요.</p>
          <div key={version} className={version ? 'result-body is-fading' : 'result-body'}>
            <div className="result-list">
              <div className="section-title result-title">
                <h2 id="result-title">언제 무엇을</h2>
              </div>
              {ROWS.map((n) => (
                <div key={n} className="result-row">
                  <p className="result-time">
                    시간 {n}
                    <br />
                    <span>추후 결정</span>
                  </p>
                  <div className="photo photo-empty result-photo">이미지</div>
                  <div className="result-desc">
                    <p>무엇을 · 어떻게 — 결과 산출 기준 추후 결정</p>
                    <span className="skeleton-bar" aria-hidden="true" style={{ width: '92%' }} />
                    <span className="skeleton-bar" aria-hidden="true" style={{ width: '64%' }} />
                  </div>
                </div>
              ))}
            </div>
            <aside className="result-box" aria-labelledby="box-title">
              <h2 id="box-title" className="result-box-title">
                정기배송 구성 제안
              </h2>
              {ROWS.map((n) => (
                <div key={n} className="result-box-row">
                  <span>
                    상품 {n} <span className="muted">· 추후 결정</span>
                  </span>
                  <span className="qty">수량 —</span>
                </div>
              ))}
              <p className="result-box-note">주 1회 배송 · 해지·변경은 조건 없이 언제든</p>
            </aside>
          </div>

          {/* P03-S04 루틴 혜택 안내 */}
          <div id="P03-S04" className="routine-benefit">
            <p>
              이 구성으로 시작하면 첫 배송은 저희가 준비할게요.
              <br />
              <span className="muted">
                배송비는 매회 무료이고, 가입 무료 단품은 첫 상자에 함께 넣어 드려요.
              </span>
            </p>
            <Link
              to="/subscribe"
              state={{ tab: 'routine' }}
              id="P03-B01"
              className="btn btn-primary btn-key"
            >
              이 구성으로 정기배송 신청
              <ArrowIcon />
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}

export default Routine
