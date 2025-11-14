import { useEffect, useState } from 'react';
import Navbar from './Navbar';
import './OrderFailPage.css';

function OrderFailPage({ errorMessage, onBack, onRetry, onSignupClick, onLoginClick, onAdminClick, onLogout, onViewOrders }) {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // 5초 후 자동으로 이전 페이지로 이동
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (onBack) onBack();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onBack]);

  return (
    <div className="order-fail-page">
      <Navbar 
        onSignupClick={onSignupClick} 
        onLoginClick={onLoginClick}
        onAdminClick={onAdminClick}
        onCartClick={() => {}}
        onLogout={onLogout}
        onViewOrders={onViewOrders}
      />

      <main className="order-fail-main">
        <div className="order-fail-container">
          <div className="fail-icon">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="#ef4444" strokeWidth="2" fill="none"/>
              <path d="M15 9l-6 6M9 9l6 6" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          <h1 className="fail-title">주문 처리에 실패했습니다</h1>
          <p className="fail-message">
            {errorMessage || '주문 처리 중 오류가 발생했습니다. 다시 시도해주세요.'}
          </p>

          <div className="fail-info">
            <p className="info-text">
              문제가 계속되면 고객센터로 문의해주세요.
            </p>
          </div>

          <div className="fail-actions">
            {onRetry && (
              <button 
                type="button" 
                className="retry-button"
                onClick={onRetry}
              >
                다시 시도하기
              </button>
            )}
            <button 
              type="button" 
              className="back-button"
              onClick={onBack}
            >
              이전 페이지로 돌아가기
            </button>
          </div>

          <p className="auto-redirect">
            {countdown}초 후 자동으로 이전 페이지로 이동합니다.
          </p>
        </div>
      </main>
    </div>
  );
}

export default OrderFailPage;

