import { useState } from 'react';
import PasswordInput from '../components/PasswordInput';
import AgreementCheckboxes from '../components/AgreementCheckboxes';
import { apiFetchJson } from '../utils/api';

function RegisterPage({ onBack, onLoginClick }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
    user_type: 'customer',
    address: ''
  });
  const [agreements, setAgreements] = useState({
    all: false,
    terms: false,
    privacy: false,
    marketing: false
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    // 비밀번호 확인 검증
    if (formData.password !== formData.passwordConfirm) {
      setMessage('비밀번호가 일치하지 않습니다.');
      return;
    }

    // 필수 약관 동의 확인
    if (!agreements.terms || !agreements.privacy) {
      setMessage('필수 약관에 동의해주세요.');
      return;
    }

    try {
      const result = await apiFetchJson('/api/users', {
        method: 'POST',
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
          password: formData.password,
          user_type: formData.user_type,
          address: formData.address
        })
      });

      if (result.success) {
        setMessage('회원가입이 완료되었습니다!');
        setFormData({
          name: '',
          email: '',
          password: '',
          passwordConfirm: '',
          user_type: 'customer',
          address: ''
        });
        setAgreements({
          all: false,
          terms: false,
          privacy: false,
          marketing: false
        });
      } else {
        setMessage(result.message || '회원가입에 실패했습니다.');
      }
    } catch (error) {
      setMessage('회원가입 중 오류가 발생했습니다.');
      console.error(error);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-header">
        <h1>회원가입</h1>
        <p className="signup-subtitle">새로운 계정을 만들어 쇼핑을 시작하세요</p>
      </div>
      
      <form onSubmit={handleSubmit} className="signup-form">
        <div className="form-group">
          <label htmlFor="name">이름</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">이메일</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
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
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="passwordConfirm">비밀번호 확인</label>
          <input
            type="password"
            id="passwordConfirm"
            name="passwordConfirm"
            value={formData.passwordConfirm}
            onChange={handleChange}
            placeholder="비밀번호를 다시 입력하세요"
            required
          />
        </div>

        <AgreementCheckboxes
          agreements={agreements}
          onAgreementChange={setAgreements}
        />

        <button type="submit" className="submit-btn">
          회원가입
        </button>

        {message && (
          <div className={`message ${message.includes('완료') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}
      </form>

      <div className="signup-footer">
        {onLoginClick && (
          <button onClick={onLoginClick} className="link-button">
            이미 계정이 있으신가요? 로그인
          </button>
        )}
        <button onClick={onBack} className="back-button">
          ← 메인으로
        </button>
      </div>
    </div>
  );
}

export default RegisterPage;

