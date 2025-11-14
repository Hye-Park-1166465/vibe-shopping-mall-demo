import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import { apiFetchJson } from '../utils/api';
import './CheckoutPage.css';

function CheckoutPage({ onBack, onSignupClick, onLoginClick, onAdminClick, onLogout, onOrderSuccess, onOrderFail, onViewOrders }) {
  const [cart, setCart] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  
  // 폼 데이터
  const [formData, setFormData] = useState({
    shippingAddress: '',
    recipientName: '',
    recipientPhone: '',
    paymentMethod: 'card'
  });

  // 포트원(iamport) 결제 모듈 초기화
  useEffect(() => {
    const { IMP } = window;
    if (IMP) {
      IMP.init('imp22144764'); // 고객사 식별코드
      console.log('포트원 결제 모듈 초기화 완료');
    } else {
      console.error('포트원 스크립트가 로드되지 않았습니다.');
    }
  }, []);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 결제 방법을 포트원 pg와 pay_method로 매핑
  const getPaymentConfig = (paymentMethod) => {
    const config = {
      card: { pg: 'html5_inicis', pay_method: 'card' },
      bank_transfer: { pg: 'html5_inicis', pay_method: 'trans' },
      virtual_account: { pg: 'html5_inicis', pay_method: 'vbank' },
      kakao_pay: { pg: 'html5_inicis', pay_method: 'card' },
      naver_pay: { pg: 'html5_inicis', pay_method: 'card' }
    };
    return config[paymentMethod] || config.card;
  };

  // 주문 고유번호 생성
  const generateMerchantUid = () => {
    return `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 폼 검증
    if (!formData.shippingAddress.trim()) {
      setMessage('배송지 주소를 입력해주세요.');
      return;
    }
    if (!formData.recipientName.trim()) {
      setMessage('수령인 이름을 입력해주세요.');
      return;
    }
    if (!formData.recipientPhone.trim()) {
      setMessage('수령인 전화번호를 입력해주세요.');
      return;
    }

    if (!cart || !cart.items || cart.items.length === 0) {
      setMessage('장바구니가 비어있습니다.');
      return;
    }

    // 포트원 스크립트 확인
    const { IMP } = window;
    if (!IMP) {
      setMessage('결제 모듈을 불러올 수 없습니다. 페이지를 새로고침해주세요.');
      return;
    }

    const totalAmount = calculateTotal();
    const merchantUid = generateMerchantUid();
    const paymentConfig = getPaymentConfig(formData.paymentMethod);
    
    // 상품명 생성 (여러 상품인 경우 "상품명 외 N개" 형식)
    const productNames = cart.items.map(item => item.name);
    const productName = productNames.length === 1 
      ? productNames[0] 
      : `${productNames[0]} 외 ${productNames.length - 1}개`;

    setIsSubmitting(true);

    // 포트원 결제 요청 파라미터 구성
    const paymentParams = {
      pg: paymentConfig.pg, // 강의 요구사항에 따라 명시적으로 지정
      pay_method: paymentConfig.pay_method,
      merchant_uid: merchantUid,
      name: productName,
      amount: totalAmount,
      buyer_name: formData.recipientName,
      buyer_tel: formData.recipientPhone,
      buyer_email: '', // 필요시 추가
      m_redirect_url: `${window.location.origin}/checkout/complete` // 결제 완료 후 리다이렉트 URL
    };

    // 포트원 결제 요청
    IMP.request_pay(paymentParams, async (rsp) => {
      // 결제 응답 처리
      if (rsp.success) {
        // 결제 성공 시 서버에 주문 생성 요청
        try {
          const result = await apiFetchJson('/api/orders', {
            method: 'POST',
            body: JSON.stringify({
              paymentMethod: formData.paymentMethod,
              shippingAddress: formData.shippingAddress.trim(),
              recipientName: formData.recipientName.trim(),
              recipientPhone: formData.recipientPhone.trim(),
              clearCart: true,
              // 결제 정보
              imp_uid: rsp.imp_uid,
              merchant_uid: rsp.merchant_uid,
              paid_amount: rsp.paid_amount
            })
          });

          if (!result.success) {
            throw new Error(result.message || '주문 생성에 실패했습니다.');
          }

          if (result.success && result.data) {
            // 주문 성공 페이지로 이동
            console.log('[CheckoutPage] 주문 생성 성공:', result.data);
            setIsSubmitting(false);
            
            // 주문 성공 페이지로 이동
            if (onOrderSuccess) {
              onOrderSuccess(result.data);
              return; // 성공 시 즉시 리턴하여 추가 처리 방지
            } else {
              setMessage('주문이 성공적으로 완료되었습니다!');
              setTimeout(() => {
                onBack();
              }, 2000);
              return;
            }
          } else {
            // result.success가 false인 경우
            throw new Error(result.message || '주문 생성에 실패했습니다.');
          }
        } catch (error) {
          console.error('[CheckoutPage] 주문 생성 오류:', error);
          setIsSubmitting(false);
          
          // 주문 실패 페이지로 이동
          if (onOrderFail) {
            onOrderFail(error.message || '주문 처리 중 오류가 발생했습니다.');
            return; // 실패 시 즉시 리턴하여 추가 처리 방지
          } else {
            setMessage(error.message || '주문 처리 중 오류가 발생했습니다.');
          }
        }
      } else {
        // 결제 실패
        console.error('[CheckoutPage] 결제 실패:', rsp);
        setIsSubmitting(false);
        const errorMsg = `결제에 실패했습니다: ${rsp.error_msg || '알 수 없는 오류'}`;
        
        if (onOrderFail) {
          onOrderFail(errorMsg);
          return; // 실패 시 즉시 리턴하여 추가 처리 방지
        } else {
          setMessage(errorMsg);
        }
      }
    });
  };

  const calculateTotal = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const totalItems = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const paymentMethods = [
    { value: 'card', label: '신용카드' },
    { value: 'bank_transfer', label: '계좌이체' },
    { value: 'virtual_account', label: '가상계좌' },
    { value: 'kakao_pay', label: '카카오페이' },
    { value: 'naver_pay', label: '네이버페이' }
  ];

  return (
    <div className="checkout-page">
      <Navbar 
        onSignupClick={onSignupClick} 
        onLoginClick={onLoginClick}
        onAdminClick={onAdminClick}
        onCartClick={() => {}}
        onLogout={onLogout}
        onViewOrders={onViewOrders}
      />

      <main className="checkout-main">
        <div className="checkout-container">
          <header className="checkout-header">
            <h1>주문하기</h1>
            <button type="button" className="back-button" onClick={onBack}>
              ← 장바구니로 돌아가기
            </button>
          </header>

          {message && (
            <div className={`checkout-message ${message.includes('성공') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          {isLoading ? (
            <div className="checkout-loading">
              <p>주문 정보를 불러오는 중...</p>
            </div>
          ) : !cart || !cart.items || cart.items.length === 0 ? (
            <div className="checkout-empty">
              <p>장바구니가 비어있습니다.</p>
              <button type="button" className="primary-button" onClick={onBack}>
                장바구니로 돌아가기
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="checkout-form">
              <div className="checkout-content">
                {/* 주문 상품 목록 */}
                <section className="checkout-section">
                  <h2 className="section-title">주문 상품</h2>
                  <div className="checkout-items">
                    {cart.items.map((item) => (
                      <div key={item._id} className="checkout-item">
                        <div className="checkout-item-image">
                          <img 
                            src={item.image} 
                            alt={item.name}
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80';
                            }}
                          />
                        </div>
                        <div className="checkout-item-info">
                          <h3>{item.name}</h3>
                          {item.size && (
                            <p className="checkout-item-size">사이즈: {item.size}</p>
                          )}
                          <p className="checkout-item-quantity">수량: {item.quantity}개</p>
                          <p className="checkout-item-price">{item.price.toLocaleString()}원</p>
                        </div>
                        <div className="checkout-item-total">
                          <p>{(item.price * item.quantity).toLocaleString()}원</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* 배송지 정보 */}
                <section className="checkout-section">
                  <h2 className="section-title">배송지 정보</h2>
                  <div className="form-group">
                    <label htmlFor="shippingAddress">배송지 주소 *</label>
                    <input
                      type="text"
                      id="shippingAddress"
                      name="shippingAddress"
                      value={formData.shippingAddress}
                      onChange={handleInputChange}
                      placeholder="배송지 주소를 입력해주세요"
                      required
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="recipientName">수령인 이름 *</label>
                      <input
                        type="text"
                        id="recipientName"
                        name="recipientName"
                        value={formData.recipientName}
                        onChange={handleInputChange}
                        placeholder="수령인 이름"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="recipientPhone">수령인 전화번호 *</label>
                      <input
                        type="tel"
                        id="recipientPhone"
                        name="recipientPhone"
                        value={formData.recipientPhone}
                        onChange={handleInputChange}
                        placeholder="010-0000-0000"
                        required
                      />
                    </div>
                  </div>
                </section>

                {/* 결제 방법 */}
                <section className="checkout-section">
                  <h2 className="section-title">결제 방법</h2>
                  <div className="payment-methods">
                    {paymentMethods.map((method) => (
                      <label key={method.value} className="payment-method-option">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.value}
                          checked={formData.paymentMethod === method.value}
                          onChange={handleInputChange}
                        />
                        <span>{method.label}</span>
                      </label>
                    ))}
                  </div>
                </section>
              </div>

              {/* 주문 요약 */}
              <aside className="checkout-summary">
                <h2 className="summary-title">주문 요약</h2>
                <div className="summary-content">
                  <div className="summary-row">
                    <span>총 상품 수</span>
                    <span>{totalItems}개</span>
                  </div>
                  <div className="summary-row total">
                    <span>총 결제 금액</span>
                    <span>{calculateTotal().toLocaleString()}원</span>
                  </div>
                  <button
                    type="submit"
                    className="submit-checkout-btn"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? '주문 처리 중...' : '주문하기'}
                  </button>
                </div>
              </aside>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}

export default CheckoutPage;

