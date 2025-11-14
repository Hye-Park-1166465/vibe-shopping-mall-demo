import { useState } from 'react';
import Navbar from './Navbar';
import { apiFetchJson } from '../utils/api';
import './ProductDetailPage.css';

function ProductDetailPage({ product, onBack, onCartClick, onSignupClick, onLoginClick, onAdminClick, onLogout, onViewOrders }) {
  const [selectedSize, setSelectedSize] = useState('M'); // 기본 사이즈
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [message, setMessage] = useState('');

  if (!product) {
    return (
      <div className="product-detail-page">
        <div className="product-detail-empty">
          <p>상품 정보를 불러올 수 없습니다.</p>
          <button type="button" className="back-button" onClick={onBack}>
            ← 메인으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const {
    name,
    image,
    price,
    category,
    description,
    sku
  } = product;

  const priceNumber = Number(price);
  const formattedPrice = !Number.isNaN(priceNumber)
    ? `${priceNumber.toLocaleString()}원`
    : typeof price === 'string'
    ? price
    : '';

  const handleAddToCart = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      setMessage('로그인이 필요합니다.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    if (!product || !product._id) {
      setMessage('상품 정보를 찾을 수 없습니다.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    try {
      setIsAddingToCart(true);
      setMessage('');

      const result = await apiFetchJson('/api/carts/items', {
        method: 'POST',
        body: JSON.stringify({
          productId: product._id,
          quantity: 1,
          size: selectedSize
        })
      });

      if (result.success) {
        setMessage('장바구니에 상품이 추가되었습니다.');
        setTimeout(() => setMessage(''), 3000);
        
        // Navbar의 장바구니 개수를 업데이트하기 위한 이벤트 발생
        window.dispatchEvent(new CustomEvent('cartUpdated'));
      } else {
        throw new Error(result.message || '장바구니에 상품을 추가하는데 실패했습니다.');
      }
    } catch (error) {
      console.error('장바구니 추가 오류:', error);
      setMessage(error.message || '장바구니에 상품을 추가하는데 실패했습니다.');
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <div className="product-detail-page">
      <Navbar 
        onSignupClick={onSignupClick} 
        onLoginClick={onLoginClick}
        onAdminClick={onAdminClick}
        onCartClick={onCartClick}
        onLogout={onLogout}
        onViewOrders={onViewOrders}
      />
      {message && (
        <div className={`product-detail-message ${message.includes('성공') || message.includes('추가') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}
      <div className="product-detail-container">
        <div className="product-detail-image">
          <img
            src={image}
            alt={name}
            onError={(e) => {
              e.target.src =
                'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80';
            }}
          />
        </div>
        <div className="product-detail-info">
          <header className="product-detail-header">
            <span className="product-breadcrumb">{category || '제품'}</span>
            <h1>{name}</h1>
            {formattedPrice && (
              <p className="product-price">{formattedPrice}</p>
            )}
          </header>

          <div className="product-meta">
            {sku && (
              <div className="product-meta-item">
                <span className="meta-label">SKU</span>
                <span className="meta-value">{sku}</span>
              </div>
            )}
            {category && (
              <div className="product-meta-item">
                <span className="meta-label">카테고리</span>
                <span className="meta-value">{category}</span>
              </div>
            )}
          </div>

          <section className="product-sizes">
            <h2>사이즈 선택</h2>
            <div className="size-grid">
              {['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                <button
                  key={size}
                  type="button"
                  className={`size-button ${selectedSize === size ? 'active' : ''}`}
                  onClick={() => setSelectedSize(size)}
                  aria-pressed={selectedSize === size}
                >
                  {size}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="primary-button"
              onClick={handleAddToCart}
              disabled={isAddingToCart}
            >
              {isAddingToCart ? '추가 중...' : '장바구니에 담기'}
            </button>
            <p className="size-helper">
              ※ 사이즈 가이드는 참고용으로 실제 상품과 차이가 있을 수 있습니다.
            </p>
          </section>

          <section className="product-description-section">
            <h2>제품 설명</h2>
            <p className="product-description-text">
              {description
                ? description
                : '등록된 설명이 없습니다. 어드민 페이지에서 상품 설명을 추가해 주세요.'}
            </p>
          </section>

          <section className="product-highlight-section">
            <h2>하이라이트</h2>
            <ul className="highlight-list">
              <li>지속 가능한 소재와 제조 공정을 사용합니다.</li>
              <li>따뜻하고 편안한 착용감을 제공하는 친환경 플리스 소재.</li>
              <li>일상 생활과 야외 활동 모두에 적합한 다용도 디자인.</li>
            </ul>
          </section>

          <div className="product-detail-footer">
            <button type="button" className="back-button" onClick={onBack}>
              ← 메인으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailPage;

