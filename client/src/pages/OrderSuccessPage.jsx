import Navbar from './Navbar';
import './OrderSuccessPage.css';

function OrderSuccessPage({ orderData, onBack, onSignupClick, onLoginClick, onAdminClick, onLogout, onViewOrders }) {
  // 주문 상태를 한국어로 변환
  const getStatusKorean = (status) => {
    const statusMap = {
      'pending': '대기중',
      'confirmed': '주문확인',
      'processing': '상품준비중',
      'shipped': '배송시작',
      'delivered': '배송완료',
      'cancelled': '주문취소'
    };
    return statusMap[status] || status;
  };

  return (
    <div className="order-success-page">
      <Navbar 
        onSignupClick={onSignupClick} 
        onLoginClick={onLoginClick}
        onAdminClick={onAdminClick}
        onCartClick={() => {}}
        onLogout={onLogout}
        onViewOrders={onViewOrders}
      />

      <main className="order-success-main">
        <div className="order-success-container">
          <div className="success-icon">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="#10b981" strokeWidth="2" fill="none"/>
              <path d="M8 12l2 2 4-4" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          <h1 className="success-title">주문이 완료되었습니다!</h1>
          <p className="success-message">
            주문해 주셔서 감사합니다.
          </p>
          <p className="success-submessage">
            주문 확인 이메일을 곧 받으실 수 있습니다.
          </p>

          {orderData ? (
            <div className="order-info">
              <h3 className="order-info-title">주문 정보</h3>
              {orderData.status && (
                <div className="order-status-badge-container">
                  <span className={`order-status-badge ${orderData.status}`}>
                    {getStatusKorean(orderData.status)}
                  </span>
                </div>
              )}
              <div className="info-row">
                <span className="info-label">주문 번호</span>
                <span className="info-value">{orderData.orderNumber || orderData._id}</span>
              </div>
              {orderData.createdAt && (
                <div className="info-row">
                  <span className="info-label">주문 날짜</span>
                  <span className="info-value">
                    {new Date(orderData.createdAt).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              )}
              <div className="info-row">
                <span className="info-label">결제 금액</span>
                <span className="info-value">₩{orderData.totalAmount?.toLocaleString()}</span>
              </div>
            </div>
          ) : (
            <div className="order-info">
              <p style={{ textAlign: 'center', color: '#6b7280' }}>
                주문이 성공적으로 완료되었습니다.
              </p>
            </div>
          )}

          {/* 다음 단계 섹션 */}
          <div className="next-steps">
            <h3 className="next-steps-title">다음 단계</h3>
            <div className="steps-list">
              <div className="step-item">
                <div className="step-icon">📧</div>
                <div className="step-content">
                  <h4>주문 확인 이메일</h4>
                  <p>주문 상세 내역이 포함된 확인 이메일을 곧 받으실 수 있습니다.</p>
                </div>
              </div>
              <div className="step-item">
                <div className="step-icon">📦</div>
                <div className="step-content">
                  <h4>주문 처리</h4>
                  <p>주문이 처리되어 포장되며, 영업일 기준 1-2일 내에 배송이 시작됩니다.</p>
                </div>
              </div>
              <div className="step-item">
                <div className="step-icon">🚚</div>
                <div className="step-content">
                  <h4>배송 시작</h4>
                  <p>배송이 시작되면 이메일로 추적 번호를 보내드립니다.</p>
                </div>
              </div>
            </div>
          </div>

          {/* 문의사항 섹션 */}
          <div className="contact-section">
            <h3 className="contact-title">문의사항이 있으신가요?</h3>
            <div className="contact-info">
              <p>이메일: support@cider.com</p>
              <p>전화: 1-800-CIDER-1</p>
            </div>
          </div>

          <div className="success-actions">
            <button 
              type="button" 
              className="primary-button view-orders-button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('[OrderSuccessPage] 주문 목록보기 버튼 클릭');
                if (onViewOrders) {
                  console.log('[OrderSuccessPage] onViewOrders 호출');
                  onViewOrders();
                } else {
                  console.warn('[OrderSuccessPage] onViewOrders prop이 전달되지 않았습니다.');
                }
              }}
            >
              주문 목록보기
            </button>
            <button 
              type="button" 
              className="primary-button continue-shopping-button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (onBack) {
                  onBack();
                }
              }}
            >
              계속 쇼핑하기
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default OrderSuccessPage;

