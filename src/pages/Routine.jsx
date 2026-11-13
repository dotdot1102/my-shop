import { useState } from 'react'
import { Link } from 'react-router-dom'
import ArrowIcon from '../components/ArrowIcon.jsx'
import { routinePlan } from '../data/routine.js'
import { loadRoutine, saveRoutine } from '../lib/storage.js'
import './Routine.css'

// 질문·선택지 (출처: Figma 와이어프레임 P-03)
const TICKS = ['06:00', '07:00', '08:00', '09:00', '10:00']
const TICK_SPOKEN = ['오전 6시', '오전 7시', '오전 8시', '오전 9시', '오전 10시']
const CHIPS = ['주 5일 출근', '주로 재택', '유연한 일정', '등교·통학']

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
          <h1 className="page-title">내 하루에 맞는 루틴을 찾아보세요</h1>
          <p className="routine-lead">
            출근 시간과 생활 패턴을 고르면, 언제 무엇을 즐기면 좋을지 제안해 드려요.
          </p>
        </section>

        {/* P03-S02 선택 영역 */}
        <section id="P03-S02" className="routine-pick" aria-label="루틴 선택">
          <div className="routine-question">
            <label htmlFor="commute" className="question">
              보통 몇 시에 출근하시나요? · {TICK_SPOKEN[tick]}
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
              aria-valuetext={TICK_SPOKEN[tick]}
            />
            <div className="ticks" aria-hidden="true">
              {TICKS.map((label, i) => (
                <span key={label} className={i === tick ? 'is-on' : undefined}>
                  {label}
                </span>
              ))}
            </div>
            <p className="question-hint">평소 집을 나서는 시간을 선택해 주세요.</p>
          </div>

          <div className="routine-question">
            <p id="pattern-q" className="question">
              평소 생활 패턴은 어떤가요?
            </p>
            <div role="group" aria-labelledby="pattern-q" className="chips">
              {CHIPS.map((label, i) => (
                <button
                  key={label}
                  type="button"
                  className={i === chip ? 'chip is-on' : 'chip'}
                  aria-pressed={i === chip}
                  onClick={() => {
                    if (i !== chip) update({ chip: i })
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="question-hint">가장 가까운 생활 패턴을 하나 골라 주세요.</p>
          </div>
        </section>

        {/* P03-S03 결과 영역 */}
        <section id="P03-S03" className="routine-result" aria-labelledby="result-title">
          <p className="result-note">
            오전 8시 출근 · 주 5일 출근을 선택한 예시예요. 선택을 바꾸면 추천도 달라져요.
          </p>
          <div key={version} className={version ? 'result-body is-fading' : 'result-body'}>
            <div className="result-list">
              <div className="section-title result-title">
                <h2 id="result-title">하루에 세 번, 나를 챙기는 시간</h2>
              </div>
              {routinePlan.map((item) => (
                <div key={item.time} className="result-row">
                  <p className="result-time">{item.time}</p>
                  <div className="photo result-photo">
                    <img src={item.product.image} alt={item.product.name} />
                  </div>
                  <div className="result-desc">
                    <h3 className="result-item-title">{item.title}</h3>
                    <p>{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
            <aside className="result-box" aria-labelledby="box-title">
              <h2 id="box-title" className="result-box-title">
                일주일 루틴 구성 · 추천 예시
              </h2>
              {routinePlan.map((item) => (
                <div key={item.time} className="result-box-row">
                  <span>{item.product.name}</span>
                  <span className="qty">
                    {item.weeklyQty}
                    {item.unit}
                  </span>
                </div>
              ))}
              <p className="result-box-note">주 1회 배송 · 해지·변경은 조건 없이 언제든</p>
            </aside>
          </div>

          {/* P03-S04 루틴 혜택 안내 */}
          <div id="P03-S04" className="routine-benefit">
            <p>이 루틴으로 정기배송을 시작하면, 첫 회 배송비는 무료예요.</p>
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
