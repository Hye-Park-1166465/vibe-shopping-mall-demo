import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import { apiFetchJson } from '../utils/api';
import './CartPage.css';

function CartPage({ onBack, onSignupClick, onLoginClick, onAdminClick, onLogout, onOrderClick, onViewOrders }) {
  const [cart, setCart] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setMessage('로그인이 필요합니다.');
        setIsLoading(false);
        return;
      }

      const result = await apiFetchJson('/api/carts', {
        method: 'GET'
      });

      if (result.success) {
        setCart(result.data);
      } else {
        setMessage(result.message || '장바구니를 불러올 수 없습니다.');
      }
    } catch (error) {
      console.error('장바구니 조회 오류:', error);
      setMessage('장바구니를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveItem(itemId);
      return;
    }

    try {
      const result = await apiFetchJson(`/api/carts/items/${itemId}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity: newQuantity })
      });

      if (result.success) {
        setCart(result.data);
        setMessage('수량이 변경되었습니다.');
        setTimeout(() => setMessage(''), 3000);
      } else {
        throw new Error(result.message || '수량 변경에 실패했습니다.');
      }
    } catch (error) {
      console.error('수량 변경 오류:', error);
      setMessage('수량 변경 중 오류가 발생했습니다.');
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const handleRemoveItem = async (itemId) => {
    if (!window.confirm('정말로 이 상품을 장바구니에서 제거하시겠습니까?')) {
      return;
    }

    try {
      const result = await apiFetchJson(`/api/carts/items/${itemId}`, {
        method: 'DELETE'
      });

      if (result.success) {
        setCart(result.data);
        setMessage('상품이 장바구니에서 제거되었습니다.');
        setTimeout(() => setMessage(''), 3000);
      } else {
        throw new Error(result.message || '상품 제거에 실패했습니다.');
      }
    } catch (error) {
      console.error('상품 제거 오류:', error);
      setMessage('상품 제거 중 오류가 발생했습니다.');
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const handleClearCart = async () => {
    if (!window.confirm('정말로 장바구니를 비우시겠습니까?')) {
      return;
    }

    try {
      const result = await apiFetchJson('/api/carts', {
        method: 'DELETE'
      });

      if (result.success) {
        setCart(result.data);
        setMessage('장바구니가 비워졌습니다.');
        setTimeout(() => setMessage(''), 3000);
      } else {
        throw new Error(result.message || '장바구니 비우기에 실패했습니다.');
      }
    } catch (error) {
      console.error('장바구니 비우기 오류:', error);
      setMessage('장바구니 비우기 중 오류가 발생했습니다.');
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const calculateTotal = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const totalItems = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <div className="cart-page">
      <Navbar 
        onSignupClick={onSignupClick} 
        onLoginClick={onLoginClick}
        onAdminClick={onAdminClick}
        onCartClick={() => {}} // 이미 장바구니 페이지에 있음
        onLogout={onLogout}
        onViewOrders={onViewOrders}
      />

      <main className="cart-main">
        <div className="cart-container">
          <header className="cart-header">
            <h1>장바구니</h1>
            <button type="button" className="back-button" onClick={onBack}>
              ← 메인으로 돌아가기
            </button>
          </header>

          {message && (
            <div className={`cart-message ${message.includes('성공') || message.includes('변경') || message.includes('제거') || message.includes('비워') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          {isLoading ? (
            <div className="cart-loading">
              <p>장바구니를 불러오는 중...</p>
            </div>
          ) : !cart || !cart.items || cart.items.length === 0 ? (
            <div className="cart-empty">
              <p>장바구니가 비어있습니다.</p>
              <button type="button" className="primary-button" onClick={onBack}>
                쇼핑하러 가기
              </button>
            </div>
          ) : (
            <>
              <div className="cart-items">
                {cart.items.map((item) => (
                  <div key={item._id} className="cart-item">
                    <div className="cart-item-image">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80';
                        }}
                      />
                    </div>
                    <div className="cart-item-info">
                      <h3>{item.name}</h3>
                      {item.size && (
                        <p className="cart-item-size">사이즈: {item.size}</p>
                      )}
                      <p className="cart-item-price">{item.price.toLocaleString()}원</p>
                    </div>
                    <div className="cart-item-actions">
                      <div className="quantity-controls">
                        <button
                          type="button"
                          className="quantity-btn"
                          onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                        >
                          -
                        </button>
                        <span className="quantity-value">{item.quantity}</span>
                        <button
                          type="button"
                          className="quantity-btn"
                          onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        className="remove-btn"
                        onClick={() => handleRemoveItem(item._id)}
                      >
                        삭제
                      </button>
                    </div>
                    <div className="cart-item-total">
                      <p>{(item.price * item.quantity).toLocaleString()}원</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="cart-summary">
                <div className="summary-row">
                  <span>총 상품 수</span>
                  <span>{totalItems}개</span>
                </div>
                <div className="summary-row total">
                  <span>총 결제 금액</span>
                  <span>{calculateTotal().toLocaleString()}원</span>
                </div>
                <div className="cart-actions">
                  <button
                    type="button"
                    className="clear-cart-btn"
                    onClick={handleClearCart}
                  >
                    장바구니 비우기
                  </button>
                  <button
                    type="button"
                    className="checkout-btn"
                    onClick={() => {
                      if (onOrderClick) {
                        onOrderClick();
                      }
                    }}
                  >
                    결제하기
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default CartPage;

