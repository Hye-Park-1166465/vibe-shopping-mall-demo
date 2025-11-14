import { useEffect, useState, useCallback } from 'react';
import { apiFetch, apiFetchJson } from '../utils/api';
import './Navbar.css';

function Navbar({ onSignupClick, onLoginClick, onAdminClick, onCartClick, onLogout, onViewOrders }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [showAdminDropdown, setShowAdminDropdown] = useState(false);

  useEffect(() => {
    const fetchUserInfo = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setIsLoading(false);
        return;
      }

      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          setIsLoading(false);
        } catch (error) {
          console.error('저장된 유저 정보 파싱 오류:', error);
        }
      }

      try {
        const response = await apiFetch('/api/auth/me', {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache'
          }
        });

        if (response.status === 304) {
          if (savedUser) {
            try {
              const parsedUser = JSON.parse(savedUser);
              setUser(parsedUser);
            } catch (error) {
              console.error('저장된 유저 정보 파싱 오류:', error);
            }
          }
          setIsLoading(false);
          return;
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success && result.data) {
          setUser(result.data);
          localStorage.setItem('user', JSON.stringify(result.data));
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      } catch (error) {
        console.error('유저 정보 가져오기 오류:', error);
        if (!savedUser) {
          localStorage.removeItem('token');
          setUser(null);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  // 장바구니 아이템 개수 조회 함수
  const fetchCartItems = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token || !user) {
      setCartItemCount(0);
      return;
    }

    try {
      const result = await apiFetchJson('/api/carts', {
        method: 'GET'
      });

      if (result.success && result.data) {
        const totalItems = result.data.items.reduce((sum, item) => sum + item.quantity, 0);
        setCartItemCount(totalItems);
      }
    } catch (error) {
      console.error('장바구니 조회 오류:', error);
    }
  }, [user]);

  // 장바구니 아이템 개수 조회
  useEffect(() => {
    if (user) {
      fetchCartItems();
      // 장바구니 업데이트를 위해 주기적으로 확인 (옵션)
      const interval = setInterval(fetchCartItems, 5000); // 5초마다 확인
      
      // 장바구니 업데이트 이벤트 리스너
      const handleCartUpdated = () => {
        fetchCartItems();
      };
      window.addEventListener('cartUpdated', handleCartUpdated);
      
      return () => {
        clearInterval(interval);
        window.removeEventListener('cartUpdated', handleCartUpdated);
      };
    } else {
      setCartItemCount(0);
    }
  }, [user, fetchCartItems]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setCartItemCount(0);
    setShowAdminDropdown(false);
    // 로그아웃 시 메인페이지로 이동
    if (onLogout) {
      onLogout();
    }
  };

  const isAdmin = user?.role === 'admin' || user?.user_type === 'admin';

  return (
    <header className="main-header">
      <div className="utility-bar">
        Patagonia Korea | 이번 시즌, 한계를 넘어설 준비가 되었나요?
      </div>
      <nav className="navbar">
        <div className="nav-left">
          <div className="brand">patagonia</div>
          <ul className="nav-links">
            <li><button type="button">Men&apos;s</button></li>
            <li><button type="button">Women&apos;s</button></li>
            <li><button type="button">Kids</button></li>
            <li><button type="button">Packs &amp; Gear</button></li>
            <li><button type="button">Stories</button></li>
          </ul>
        </div>
        <div className="nav-right">
          {!isLoading && !user && (
            <>
              <button
                type="button"
                className="nav-button outline"
                onClick={onLoginClick}
              >
                로그인
              </button>
              <button 
                type="button"
                className="nav-button filled"
                onClick={onSignupClick}
              >
                회원가입
              </button>
            </>
          )}
          {!isLoading && user && (
            <>
              <span className="welcome-message">
                {user.name}님 환영합니다.
              </span>
              {isAdmin && (
                <div 
                  className="admin-dropdown-container"
                  onMouseEnter={() => setShowAdminDropdown(true)}
                  onMouseLeave={() => setShowAdminDropdown(false)}
                >
                  <button 
                    type="button" 
                    className="nav-button admin-button"
                    onClick={onAdminClick}
                  >
                    어드민
                    <svg 
                      width="16" 
                      height="16" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      style={{ marginLeft: '4px', display: 'inline-block', verticalAlign: 'middle' }}
                    >
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </button>
                  {showAdminDropdown && (
                    <div 
                      className="admin-dropdown-menu"
                      onMouseEnter={() => setShowAdminDropdown(true)}
                      onMouseLeave={() => setShowAdminDropdown(false)}
                    >
                      {onViewOrders && (
                        <button
                          type="button"
                          className="dropdown-item"
                          onClick={() => {
                            setShowAdminDropdown(false);
                            if (onViewOrders) {
                              onViewOrders();
                            }
                          }}
                        >
                          내주문 목록
                        </button>
                      )}
                      <button
                        type="button"
                        className="dropdown-item"
                        onClick={() => {
                          handleLogout();
                        }}
                      >
                        로그아웃
                      </button>
                    </div>
                  )}
                </div>
              )}
              <button 
                type="button"
                className="cart-button"
                onClick={onCartClick}
                aria-label="장바구니"
              >
                <svg 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                {cartItemCount > 0 && (
                  <span className="cart-badge">{cartItemCount}</span>
                )}
              </button>
              {!isAdmin && (
                <button 
                  type="button"
                  className="nav-button outline"
                  onClick={handleLogout}
                >
                  로그아웃
                </button>
              )}
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
