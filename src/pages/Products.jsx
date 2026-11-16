import { products } from '../data/products.js'
import ProductCard from '../components/ProductCard.jsx'
import './Home.css'

// 상품 더보기 — 홈 상품 섹션(P01-S02)의 '상품 더보기' 버튼으로만 들어옴, 6개 전체 (답변 2026-11-16)
function Products() {
  return (
    <div className="band-white">
      <main className="container home-band-inner" aria-labelledby="all-products-title">
        <div className="section-title products-title">
          <h1 id="all-products-title">계절이 키운 재료 그대로</h1>
        </div>
        <div className="product-grid">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </main>
    </div>
  )
}

export default Products
