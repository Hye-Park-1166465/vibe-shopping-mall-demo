import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import './OrderManagePage.css';

function OrderManagePage({ onBack, onSignupClick, onLoginClick, onAdminClick, onLogout }) {
  const [orders, setOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]); // 전체 주문 (탭 카운트용)
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null); // null = 전체
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingOrderId, setUpdatingOrderId] = useState(null); // 업데이트 중인 주문 ID

  // 주문 상태를 한국어로 변환
  const getStatusKorean = (status) => {
    const statusMap = {
      'pending': '대기중',
      'confirmed': '확인됨',
      'processing': '처리중',
      'shipped': '배송중',
      'delivered': '완료',
      'cancelled': '취소됨'
    };
    return statusMap[status] || status;
  };

  // 주문 상태 옵션 목록
  const statusOptions = [
    { value: 'pending', label: '대기중' },
    { value: 'confirmed', label: '확인됨' },
    { value: 'processing', label: '처리중' },
    { value: 'shipped', label: '배송중' },
    { value: 'delivered', label: '완료' },
    { value: 'cancelled', label: '취소됨' }
  ];

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
    fetchAllOrders(); // 전체 주문 먼저 가져오기 (탭 카운트용)
  }, []);

  useEffect(() => {
    fetchOrders(selectedStatus);
  }, [selectedStatus]);

  // 전체 주문 가져오기 (탭 카운트용)
  const fetchAllOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/orders?limit=1000', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setAllOrders(result.data || []);
        }
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

      let url = '/api/orders';
      if (status) {
        url += `?status=${status}`;
      } else {
        url += '?limit=1000';
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('주문 목록을 불러올 수 없습니다.');
      }

      const result = await response.json();
      if (result.success) {
        setOrders(result.data || []);
      } else {
        setError(result.message || '주문 목록을 불러올 수 없습니다.');
      }
    } catch (error) {
      console.error('주문 목록 조회 오류:', error);
      setError(error.message || '주문 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 주문 상태 업데이트
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      setUpdatingOrderId(orderId);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // 주문 목록 새로고침
          fetchOrders(selectedStatus);
          fetchAllOrders();
        } else {
          alert(result.message || '주문 상태 업데이트에 실패했습니다.');
        }
      } else {
        const result = await response.json();
        alert(result.message || '주문 상태 업데이트에 실패했습니다.');
      }
    } catch (error) {
      console.error('주문 상태 업데이트 오류:', error);
      alert('주문 상태 업데이트에 실패했습니다.');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // 드롭다운 변경 핸들러
  const handleStatusChange = (orderId, newStatus) => {
    if (window.confirm('주문 상태를 변경하시겠습니까?')) {
      handleUpdateStatus(orderId, newStatus);
    }
  };

  // 검색 필터링
  const filteredOrders = orders.filter(order => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      (order.orderNumber || '').toLowerCase().includes(query) ||
      (order.user?.name || order.recipientName || '').toLowerCase().includes(query) ||
      (order.user?.email || '').toLowerCase().includes(query) ||
      (order.recipientPhone || '').includes(query)
    );
  });

  // 상태 탭 목록 (강의처럼 모든 상태 표시)
  const statusTabs = [
    { value: null, label: '전체', key: 'all' },
    { value: 'confirmed', label: '주문확인', key: 'confirmed' },
    { value: 'processing', label: '상품준비중', key: 'processing' },
    { value: 'shipped', label: '배송시작', key: 'shipped_start' },
    { value: 'shipped', label: '배송중', key: 'shipped' }, // 배송중도 shipped 상태로 필터링
    { value: 'delivered', label: '배송완료', key: 'delivered' },
    { value: 'cancelled', label: '주문취소', key: 'cancelled' }
  ];

  return (
    <div className="order-manage-page">
      <Navbar 
        onSignupClick={onSignupClick} 
        onLoginClick={onLoginClick}
        onAdminClick={onAdminClick}
        onCartClick={() => {}}
        onLogout={onLogout}
      />
      
      <div className="order-manage-container">
        <header className="manage-header">
          <h1>주문 관리</h1>
        </header>

        {/* 검색창 */}
        <div className="search-section">
          <input
            type="text"
            className="search-input"
            placeholder="주문 번호, 고객명, 이메일로 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* 상태 탭 */}
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

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="loading-message">
            <div className="loading-spinner"></div>
            <p>주문 내역을 불러오는 중...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="empty-orders">
            <div className="empty-icon">📦</div>
            <p className="empty-title">
              {searchQuery 
                ? '검색 결과가 없습니다.'
                : selectedStatus
                  ? `${getStatusKorean(selectedStatus)} 상태의 주문이 없습니다.`
                  : '주문 내역이 없습니다.'}
            </p>
          </div>
        ) : (
          <div className="orders-grid">
            {filteredOrders.map((order) => (
              <div key={order._id} className="order-card">
                <div className="order-card-header">
                  <div className="order-number">
                    {order.orderNumber || order._id}
                  </div>
                </div>

                <div className="order-card-body">
                  <div className="customer-info">
                    <div className="customer-name">
                      {order.user?.name || order.recipientName || '알 수 없음'}
                    </div>
                    <div className="customer-details">
                      {order.user?.email && (
                        <span className="customer-email">{order.user.email}</span>
                      )}
                      {order.recipientPhone && (
                        <span className="customer-phone">{order.recipientPhone}</span>
                      )}
                    </div>
                  </div>

                  <div className="order-details">
                    <div className="detail-row">
                      <span className="detail-label">주문일:</span>
                      <span className="detail-value">{formatDate(order.createdAt)}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">주문 상품:</span>
                      <span className="detail-value">{order.items?.length || 0}개</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">배송 주소:</span>
                      <span className="detail-value">{order.shippingAddress || '-'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">총 금액:</span>
                      <span className="detail-value amount">₩{order.totalAmount?.toLocaleString()}</span>
                    </div>
                    <div className="detail-row status-row">
                      <span className="detail-label">주문 상태:</span>
                      <div className="status-select-wrapper">
                        <select
                          className={`status-select ${order.status}`}
                          value={order.status}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          disabled={updatingOrderId === order._id}
                        >
                          {statusOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        {updatingOrderId === order._id && (
                          <span className="updating-indicator">업데이트 중...</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="manage-footer">
          <button onClick={onBack} className="back-button">
            ← 어드민 페이지로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderManagePage;
