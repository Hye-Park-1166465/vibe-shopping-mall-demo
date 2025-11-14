import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import { apiFetchJson } from '../utils/api';
import './OrderListPage.css';

function OrderListPage({ onBack, onSignupClick, onLoginClick, onAdminClick, onLogout, onViewOrderDetail, onViewOrders }) {
  const [orders, setOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]); // 전체 주문 (탭 카운트용)
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null); // null = 전체

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

  // 날짜 포맷팅
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // 상태별 주문 개수 계산
  const getStatusCount = (status) => {
    if (!allOrders || allOrders.length === 0) return 0;
    if (status === null) return allOrders.length;
    return allOrders.filter(order => order.status === status).length;
  };

  useEffect(() => {
    console.log('[OrderListPage] 컴포넌트 마운트됨');
    fetchAllOrders(); // 전체 주문 먼저 가져오기 (탭 카운트용)
  }, []);

  useEffect(() => {
    console.log('[OrderListPage] selectedStatus 변경:', selectedStatus);
    fetchOrders(selectedStatus);
  }, [selectedStatus]);

  // 전체 주문 가져오기 (탭 카운트용)
  const fetchAllOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const result = await apiFetchJson('/api/orders/my?limit=1000', {
        method: 'GET'
      });

      if (result.success) {
        setAllOrders(result.data || []);
      }
    } catch (error) {
      console.error('전체 주문 조회 오류:', error);
    }
  };

  const fetchOrders = async (status = null) => {
    try {
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem('token');

      if (!token) {
        setError('로그인이 필요합니다.');
        setIsLoading(false);
        return;
      }

      let url = '/api/orders/my';
      if (status) {
        url += `?status=${status}`;
      }

      const result = await apiFetchJson(url, {
        method: 'GET'
      });

      console.log('[OrderListPage] 주문 목록 응답:', result);
      if (result.success) {
        const ordersData = result.data || [];
        console.log('[OrderListPage] 주문 개수:', ordersData.length, '선택된 상태:', status);
        console.log('[OrderListPage] 주문 데이터:', ordersData);
        setOrders(ordersData);
      } else {
        console.error('[OrderListPage] API 응답 실패:', result);
        setError(result.message || '주문 목록을 불러올 수 없습니다.');
      }
    } catch (error) {
      console.error('주문 목록 조회 오류:', error);
      setError(error.message || '주문 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 상태 탭 목록
  const statusTabs = [
    { value: null, label: '전체', key: 'all' },
    { value: 'confirmed', label: '주문확인', key: 'confirmed' },
    { value: 'processing', label: '상품준비중', key: 'processing' },
    { value: 'shipped', label: '배송시작', key: 'shipped' },
    { value: 'delivered', label: '배송완료', key: 'delivered' },
    { value: 'cancelled', label: '주문취소', key: 'cancelled' }
  ];

  console.log('[OrderListPage] 렌더링:', { 
    ordersCount: orders.length, 
    isLoading, 
    error, 
    selectedStatus,
    allOrdersCount: allOrders.length 
  });

  return (
    <div className="order-list-page">
      <Navbar 
        onSignupClick={onSignupClick} 
        onLoginClick={onLoginClick}
        onAdminClick={onAdminClick}
        onCartClick={() => {}}
        onLogout={onLogout}
        onViewOrders={onViewOrders}
      />

      <main className="order-list-main">
        <div className="order-list-container">
          <header className="orders-header">
            <h1>주문 내역</h1>
            <button 
              type="button" 
              className="back-button"
              onClick={onBack}
            >
              ← 메인으로 돌아가기
            </button>
          </header>

          {/* 주문 상태 탭 */}
          <div className="status-tabs">
            {statusTabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                className={`status-tab ${selectedStatus === tab.value ? 'active' : ''}`}
                onClick={() => setSelectedStatus(tab.value)}
              >
                {tab.label} {getStatusCount(tab.value)}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="loading-message">
              <div className="loading-spinner"></div>
              <p>주문 내역을 불러오는 중...</p>
            </div>
          ) : error ? (
            <div className="error-message">
              <p>오류: {error}</p>
              <button 
                type="button" 
                className="primary-button"
                onClick={() => {
                  setError(null);
                  fetchOrders(selectedStatus);
                }}
                style={{ marginTop: '16px' }}
              >
                다시 시도
              </button>
            </div>
          ) : orders.length === 0 ? (
            <div className="empty-orders">
              <div className="empty-icon">📦</div>
              <p className="empty-title">
                {selectedStatus 
                  ? `${getStatusKorean(selectedStatus)} 상태의 주문이 없습니다.`
                  : '주문 내역이 없습니다.'}
              </p>
              <p className="empty-subtitle">
                {selectedStatus 
                  ? '다른 탭에서 주문을 확인해보세요.'
                  : '첫 주문을 시작해보세요!'}
              </p>
              <button 
                type="button" 
                className="primary-button"
                onClick={onBack}
              >
                쇼핑하러 가기
              </button>
            </div>
          ) : (
            <div className="orders-list">
              {orders.map((order) => (
                <div 
                  key={order._id} 
                  className="order-card"
                  onClick={() => onViewOrderDetail && onViewOrderDetail(order)}
                  style={{ cursor: onViewOrderDetail ? 'pointer' : 'default' }}
                >
                  <div className="order-header">
                    <div className="order-number">
                      주문 #{order.orderNumber || order._id}
                    </div>
                    <div className="order-date">
                      주문일: {formatDate(order.createdAt)}
                    </div>
                    <div className={`order-status ${order.status}`}>
                      {getStatusKorean(order.status)}
                    </div>
                  </div>

                  <div className="order-items">
                    {order.items && order.items.map((item, index) => (
                      <div key={index} className="order-item">
                        <div className="item-image">
                          <img
                            src={item.product?.image || 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80'}
                            alt={item.product?.name || '상품'}
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80';
                            }}
                          />
                        </div>
                        <div className="item-details">
                          <h3 className="item-name">{item.product?.name || '상품명 없음'}</h3>
                          <div className="item-info">
                            {item.size && (
                              <span className="item-size">Size: {item.size}</span>
                            )}
                            {item.color && (
                              <span className="item-color">Color: {item.color}</span>
                            )}
                            <span className="item-quantity">Quantity: {item.quantity}</span>
                          </div>
                          <div className="item-price">
                            ₩{((item.product?.price || 0) * item.quantity).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="order-footer">
                    <div className="order-total">
                      <span className="total-label">총 결제 금액</span>
                      <span className="total-amount">₩{order.totalAmount?.toLocaleString()}</span>
                    </div>
                    {order.paidAt && (
                      <div className="payment-date">
                        결제일: {formatDate(order.paidAt)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default OrderListPage;

