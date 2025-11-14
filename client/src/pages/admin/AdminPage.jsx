import { useState, useEffect } from 'react';
import Navbar from '../Navbar';
import { apiFetch, apiFetchJson } from '../../utils/api';
import './AdminPage.css';

function AdminPage({ onBack, onProductRegister, onProductManage, onOrderManage, onLogout, onSignupClick, onLoginClick, onAdminClick, onCartClick, onViewOrders }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    totalSales: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

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

  // 날짜 포맷팅
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // 최근 주문 데이터 가져오기
  const fetchRecentOrders = async () => {
    try {
      setIsLoadingOrders(true);
      const token = localStorage.getItem('token');
      
      const result = await apiFetchJson('/api/orders?limit=3', {
        method: 'GET'
      });

      if (result.success && result.data) {
        // 주문 데이터를 AdminPage 형식으로 변환
        const formattedOrders = result.data.map(order => ({
          id: order.orderNumber || order._id,
          customer: order.user?.name || order.recipientName || '알 수 없음',
          date: formatDate(order.createdAt),
          status: getStatusKorean(order.status),
          statusKey: order.status,
          amount: order.totalAmount || 0
        }));
        setRecentOrders(formattedOrders);
      }
    } catch (error) {
      console.error('최근 주문 조회 오류:', error);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  // 통계 데이터 가져오기
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // 주문 통계
      const ordersResult = await apiFetchJson('/api/orders?limit=1', {
        method: 'GET'
      });
      
      if (ordersResult.success) {
        setStats(prev => ({
          ...prev,
          totalOrders: ordersResult.pagination?.totalOrders || 0
        }));
        
        // 총 매출 계산 및 고객 통계
        const allOrdersResult = await apiFetchJson('/api/orders?limit=1000', {
          method: 'GET'
        });
        
        if (allOrdersResult.success && allOrdersResult.data) {
          // 총 매출 계산
          const totalSales = allOrdersResult.data.reduce((sum, order) => {
            return sum + (order.totalAmount || 0);
          }, 0);
          setStats(prev => ({
            ...prev,
            totalSales: totalSales
          }));
          
          // 고객 통계 (주문에서 고유 사용자 수 계산)
          const uniqueUsers = new Set();
          allOrdersResult.data.forEach(order => {
            if (order.user && order.user._id) {
              uniqueUsers.add(order.user._id.toString());
            }
          });
          setStats(prev => ({
            ...prev,
            totalCustomers: uniqueUsers.size
          }));
        }
      }
      
      // 상품 통계
      const productsResult = await apiFetchJson('/api/products', {
        method: 'GET'
      });
      
      if (productsResult.success && Array.isArray(productsResult.data)) {
        setStats(prev => ({
          ...prev,
          totalProducts: productsResult.data.length
        }));
      }
    } catch (error) {
      console.error('통계 데이터 조회 오류:', error);
    }
  };

  useEffect(() => {
    const checkAdminAccess = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      if (!token) {
        alert('로그인이 필요합니다.');
        onBack();
        return;
      }

      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          const isAdmin = parsedUser.role === 'admin' || parsedUser.user_type === 'admin';
          
          if (!isAdmin) {
            alert('관리자 권한이 필요합니다.');
            onBack();
            return;
          }
          
          setUser(parsedUser);
        } catch (error) {
          console.error('유저 정보 파싱 오류:', error);
          onBack();
        }
      } else {
        // 서버에서 최신 유저 정보 가져오기
        try {
          const response = await apiFetch('/api/auth/me', {
            method: 'GET',
            headers: {
              'Cache-Control': 'no-cache'
            }
          });

          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
              const isAdmin = result.data.role === 'admin' || result.data.user_type === 'admin';
              
              if (!isAdmin) {
                alert('관리자 권한이 필요합니다.');
                onBack();
                return;
              }
              
              setUser(result.data);
              localStorage.setItem('user', JSON.stringify(result.data));
            } else {
              alert('로그인이 필요합니다.');
              onBack();
            }
          } else {
            alert('로그인이 필요합니다.');
            onBack();
          }
        } catch (error) {
          console.error('유저 정보 가져오기 오류:', error);
          alert('로그인이 필요합니다.');
          onBack();
        }
      }
      
      setIsLoading(false);
    };

    checkAdminAccess();
  }, [onBack]);

  // 관리자 권한 확인 후 데이터 가져오기
  useEffect(() => {
    if (user) {
      fetchRecentOrders();
      fetchStats();
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="admin-page">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh' 
        }}>
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="admin-page">
      <Navbar 
        onSignupClick={onSignupClick} 
        onLoginClick={onLoginClick}
        onAdminClick={onAdminClick}
        onCartClick={onCartClick}
        onLogout={onLogout}
        onViewOrders={onViewOrders}
      />
      <header className="admin-header">
        <div className="admin-header-content">
          <h1>관리자 대시보드</h1>
          <p className="welcome-text">
            Patagonia 쇼핑몰 관리 시스템에 오신 것을 환영합니다.
          </p>
        </div>
      </header>

      <main className="admin-main">
        {/* 통계 카드 */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 11l3 3L22 4"></path>
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"></path>
              </svg>
            </div>
            <div className="stat-content">
              <h3>총 주문</h3>
              <p className="stat-value">{stats.totalOrders.toLocaleString()}</p>
              <p className="stat-change positive">+12% from last month</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
            </div>
            <div className="stat-content">
              <h3>총 상품</h3>
              <p className="stat-value">{stats.totalProducts.toLocaleString()}</p>
              <p className="stat-change positive">+3% from last month</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 00-3-3.87"></path>
                <path d="M16 3.13a4 4 0 010 7.75"></path>
              </svg>
            </div>
            <div className="stat-content">
              <h3>총 고객</h3>
              <p className="stat-value">{stats.totalCustomers.toLocaleString()}</p>
              <p className="stat-change positive">+8% from last month</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
            </div>
            <div className="stat-content">
              <h3>총 매출</h3>
              <p className="stat-value">₩{stats.totalSales.toLocaleString()}</p>
              <p className="stat-change positive">+15% from last month</p>
            </div>
          </div>
        </div>

        {/* 빠른 작업 & 최근 주문 */}
        <div className="admin-content-grid">
          {/* 빠른 작업 */}
          <div className="quick-actions-card">
            <h2>빠른 작업</h2>
            <button 
              type="button"
              className="quick-action-button primary"
              onClick={onProductRegister}
            >
              + 새 상품 등록
            </button>
            <div className="quick-actions-list">
              <button 
                type="button"
                className="quick-action-item"
                onClick={onProductManage}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"></path>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                  <line x1="12" y1="22.08" x2="12" y2="12"></line>
                </svg>
                <span>상품 관리</span>
              </button>
              <button 
                type="button"
                className="quick-action-item"
                onClick={onOrderManage}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 11l3 3L22 4"></path>
                  <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"></path>
                </svg>
                <span>주문 관리</span>
              </button>
              <button className="quick-action-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                </svg>
                <span>매출 분석</span>
              </button>
              <button className="quick-action-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 00-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 010 7.75"></path>
                </svg>
                <span>고객 관리</span>
              </button>
            </div>
          </div>

          {/* 최근 주문 */}
          <div className="recent-orders-card">
            <div className="card-header">
              <h2>최근 주문</h2>
              <button 
                type="button"
                className="view-all-link"
                onClick={onOrderManage}
              >
                전체보기
              </button>
            </div>
            <div className="orders-list">
              {isLoadingOrders ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
                  주문 정보를 불러오는 중...
                </div>
              ) : recentOrders.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
                  최근 주문이 없습니다.
                </div>
              ) : (
                recentOrders.map((order) => (
                  <div 
                    key={order.id} 
                    className="order-item clickable"
                    onClick={() => onOrderManage && onOrderManage()}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="order-info">
                      <div className="order-id">{order.id}</div>
                      <div className="order-customer">{order.customer}</div>
                      <div className="order-date">{order.date}</div>
                    </div>
                    <div className="order-meta">
                      <span className={`order-status ${order.statusKey === 'processing' || order.statusKey === 'pending' ? 'processing' : order.statusKey === 'delivered' || order.statusKey === 'confirmed' ? 'completed' : ''}`}>
                        {order.status}
                      </span>
                      <span className="order-amount">₩{order.amount.toLocaleString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* 뒤로 가기 버튼 */}
        <div className="admin-footer">
          <button onClick={onBack} className="back-button">
            ← 메인으로 돌아가기
          </button>
        </div>
      </main>
    </div>
  );
}

export default AdminPage;
