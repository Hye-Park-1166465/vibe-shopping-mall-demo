import { useState, useEffect } from 'react';
import PasswordInput from '../components/PasswordInput';
import { apiFetch, apiFetchJson } from '../utils/api';

function LoginPage({ onBack, onSignupClick }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 이미 로그인되어 있으면 메인 페이지로 리다이렉트
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return;
      }

      // 토큰이 있으면 유저 정보 확인
      try {
        const response = await apiFetch('/api/auth/me', {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache'
          }
        });

        if (response.status === 304 || response.ok) {
          // 이미 로그인되어 있으면 메인 페이지로 이동
          if (onBack) onBack();
        }
      } catch (error) {
        // 에러 발생 시 토큰 삭제하고 로그인 페이지 유지
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    };

    checkAuth();
  }, [onBack]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // 입력 시 에러 메시지 초기화
    if (message) setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsLoading(true);

    try {
      const result = await apiFetchJson('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      // 서버 응답 형식에 맞춘 처리 (authController.js 참고)
      if (result.success) {
        // 토큰 및 사용자 정보 저장
        localStorage.setItem('token', result.token);
        localStorage.setItem('user', JSON.stringify(result.data));
        
        setMessage(result.message || '로그인에 성공했습니다!');
        
        // 로그인 성공 후 메인 페이지로 이동
        setTimeout(() => {
          if (onBack) onBack();
        }, 1000);
      } else {
        // 서버에서 반환한 에러 메시지 표시
        setMessage(result.message || '로그인에 실패했습니다.');
      }
    } catch (error) {
      // 네트워크 오류 등 예외 처리
      console.error('로그인 오류:', error);
      setMessage('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-header">
        <h1>로그인</h1>
        <p className="login-subtitle">계정에 로그인하여 쇼핑을 시작하세요</p>
      </div>
      
      <form onSubmit={handleSubmit} className="login-form">
        <div className="form-group">
          <label htmlFor="email">이메일</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="이메일을 입력하세요"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">비밀번호</label>
          <PasswordInput
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="비밀번호를 입력하세요"
            required
          />
        </div>

        <button 
          type="submit" 
          className="submit-btn"
          disabled={isLoading}
        >
          {isLoading ? '로그인 중...' : '로그인'}
        </button>

        {message && (
          <div className={`message ${message.includes('성공') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}
      </form>

      <div className="login-footer">
        <button onClick={onSignupClick} className="link-button">
          계정이 없으신가요? 회원가입
        </button>
        <button onClick={onBack} className="back-button">
          ← 메인으로
        </button>
      </div>
    </div>
  );
}

export default LoginPage;

