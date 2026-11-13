import { Link } from 'react-router-dom'
import ArrowIcon from '../components/ArrowIcon.jsx'
import { products } from '../data/products.js'
import HeroSlider from '../components/HeroSlider.jsx'
import brandImage from '../assets/images/P01-S04.brand.jpg'
import './Home.css'

// P-01 홈
function Home() {
  return (
    <main id="top">
      {/* P01-S01 첫 화면 */}
      <section id="P01-S01" className="hero" aria-labelledby="hero-title">
        <div className="hero-panel">
          <div className="hero-text">
            <h1 id="hero-title" className="hero-title">
              <span>하루 한 번, 나를 챙기는</span>
              <span>가벼운 루틴</span>
            </h1>
            <p className="hero-body">
              아침에는 주스 한 잔, 출출할 땐 사과칩 한 줌.
              <br />내 생활에 맞는 조합을 골라
              <br />
              꾸준히 즐길 나만의 루틴을 만들어 보세요.
            </p>
            <div>
              <Link to="/routine" id="P01-B01" className="btn btn-primary">
                내 루틴 만들기
                <ArrowIcon />
              </Link>
            </div>
          </div>
        </div>
        <HeroSlider />
      </section>

      {/* P01-S02 상품 섹션 */}
      <div className="band-white home-band">
        <section
          id="P01-S02"
          className="container home-band-inner"
          aria-labelledby="products-title"
        >
          <div className="section-title products-title">
            <h2 id="products-title">계절이 키운 재료 그대로</h2>
          </div>
          <div className="product-grid">
            {products.map((p) => (
              <article key={p.id} className="product-card">
                <div className="photo product-photo">
                  <img src={p.image} alt={`${p.name}와 재료`} />
                </div>
                <div className="product-info">
                  <h3 className="product-name">{p.name}</h3>
                  <p className="product-ingredients">{p.ingredients}</p>
                  <p className="product-price-row">
                    <span className="product-price">
                      {p.volume} · {p.price}
                    </span>
                    <span className="tag">예시 가격</span>
                  </p>
                  {p.howTo ? (
                    <p className="product-howto">{p.howTo}</p>
                  ) : (
                    <p className="tbd product-tbd">언제 · 어떻게 먹을지 — 추후 결정</p>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      {/* P01-S03 가입 혜택 안내 한 줄 */}
      <section id="P01-S03" className="container benefit" aria-label="가입 혜택 안내">
        <p className="benefit-line">
          회원가입하면 단품 1회 무료권을 드려요. 무료권을 쓴 주문은 함께 담은 상품까지 배송비가
          무료예요.
          <Link to="/join" id="P01-B03" className="text-link benefit-link">
            가입하기
          </Link>
        </p>
      </section>

      {/* P01-S04 브랜드 섹션 */}
      <div className="band-white home-band home-band-last">
        <section id="P01-S04" className="container home-band-inner" aria-labelledby="brand-title">
          <div className="brand-inner">
            <div className="photo brand-photo">
              <img src={brandImage} alt="그린이슈 상품을 담은 장바구니를 든 사람" />
            </div>
            <div className="brand-text">
              <p className="brand-eyebrow">재료와 만드는 방식</p>
              <h2 id="brand-title" className="brand-title">
                꼭 필요하지 않은 것은 덜어냅니다.
              </h2>
              <p className="brand-body">
                주스 한 잔과 사과칩 한 줌으로
                <br />내 하루에 작은 습관을 더해 보세요.
                <br />
                부담 없이 이어가는 나만의 루틴을 응원합니다.
              </p>
              <div>
                <Link to="/routine" id="P01-B04" className="btn btn-secondary">
                  내 루틴 만들기
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

export default Home
