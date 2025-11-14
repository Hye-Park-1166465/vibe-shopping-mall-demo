import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import { apiFetchJson } from '../utils/api';
import './MainPage.css';

function MainPage({ onSignupClick, onLoginClick, onAdminClick, onCartClick, onLogout, onProductSelect, onViewOrders }) {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      // 전체 상품을 가져오기 위해 limit을 크게 설정
      const result = await apiFetchJson('/api/products?limit=1000');

      if (result.success) {
        setProducts(result.data || []);
      } else {
        console.error('상품 목록 가져오기 실패:', result.message);
      }
    } catch (error) {
      console.error('상품 목록 가져오기 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="home-page">
      <Navbar 
        onSignupClick={onSignupClick} 
        onLoginClick={onLoginClick}
        onAdminClick={onAdminClick}
        onCartClick={onCartClick}
        onLogout={onLogout}
        onViewOrders={onViewOrders}
      />

      <main className="main-content">
        <section className="hero-section">
          <div className="hero-overlay">
            <p className="hero-kicker">Grade VII Down Parka</p>
            <h1>궁극의 따뜻함</h1>
            <p className="hero-description">
              혹독한 기후를 견뎌낸 다운 파카. 장시간의 등반과 한계에 도전하는
              순간을 위한 최상급 보온력.
            </p>
            <button type="button" className="primary-button">
              Shop
            </button>
          </div>
        </section>

        <section className="collection-section">
          <div className="section-header">
            <h2>지금 주목할 컬렉션</h2>
            {products.length > 0 && (
              <button type="button" className="text-link">
                모두 보기
              </button>
            )}
          </div>
          {isLoading ? (
            <div className="loading-state">
              <p>상품을 불러오는 중...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <p>등록된 상품이 없습니다.</p>
            </div>
          ) : (
            <div className="collection-grid">
              {products.map((product) => (
                <article
                  key={product._id}
                  className="collection-card"
                  role="button"
                  tabIndex={0}
                  onClick={() => onProductSelect && onProductSelect(product)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onProductSelect && onProductSelect(product);
                    }
                  }}
                >
                  <div className="card-media">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80';
                      }}
                    />
                    {product.category && (
                      <span className="card-badge">{product.category}</span>
                    )}
                  </div>
                  <div className="card-content">
                    <h3>{product.name}</h3>
                    {product.price !== undefined && product.price !== null && (
                      <p>{product.price.toLocaleString()}원</p>
                    )}
                    {product.description && (
                      <p className="product-description">{product.description}</p>
                    )}
                    <button type="button" className="ghost-button">
                      Shop
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="values-section">
          <h2>우리가 지키는 약속</h2>
          <div className="values-grid">
            <div className="value-card">
              <span className="value-icon">✶</span>
              <h3>모든 제품을 보증합니다.</h3>
              <p>Patagonia 품질보증</p>
            </div>
            <div className="value-card">
              <span className="value-icon">✶</span>
              <h3>사회와 환경에 책임을 다합니다.</h3>
              <p>클럽 임팩트</p>
            </div>
            <div className="value-card">
              <span className="value-icon">✶</span>
              <h3>환경 단체를 지원합니다.</h3>
              <p>행복한 지구를 위하여</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p className="footer-note">
          © 2025 Patagonia, Inc. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
}

export default MainPage;