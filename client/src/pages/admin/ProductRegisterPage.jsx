import { useState, useEffect } from 'react';
import { apiFetchJson } from '../../utils/api';
import './ProductRegisterPage.css';

function ProductRegisterPage({ onBack }) {
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    price: '',
    category: '',
    image: '',
    description: ''
  });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  useEffect(() => {
    // Cloudinary Upload Widget 스크립트 로드
    const scriptId = 'cloudinary-upload-widget';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://widget.cloudinary.com/v2.0/global/all.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  useEffect(() => {
    if (formData.image) {
      setImagePreview(formData.image);
    } else {
      setImagePreview('');
    }
  }, [formData.image]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // 입력 시 에러 메시지 초기화
    if (message) setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsLoading(true);

    // 필수 필드 검증 (더 명확한 에러 메시지)
    const missingFields = [];
    if (!formData.sku || formData.sku.trim() === '') missingFields.push('SKU');
    if (!formData.name || formData.name.trim() === '') missingFields.push('상품명');
    if (!formData.price || formData.price.toString().trim() === '') missingFields.push('가격');
    if (!formData.category || formData.category.trim() === '') missingFields.push('카테고리');
    if (!formData.image || formData.image.trim() === '') missingFields.push('이미지 URL');

    if (missingFields.length > 0) {
      setMessage(`다음 필드는 필수입니다: ${missingFields.join(', ')}`);
      setIsLoading(false);
      return;
    }

    // 가격 검증
    const price = parseFloat(formData.price);
    if (isNaN(price) || price < 0) {
      setMessage('가격은 0 이상의 숫자여야 합니다.');
      setIsLoading(false);
      return;
    }

    // 토큰 확인
    const token = localStorage.getItem('token');
    if (!token) {
      setMessage('로그인이 필요합니다. 다시 로그인해주세요.');
      setIsLoading(false);
      return;
    }

    try {
      const requestBody = {
        sku: formData.sku.trim(),
        name: formData.name.trim(),
        price: price,
        category: formData.category.trim(),
        image: formData.image.trim(),
        description: formData.description ? formData.description.trim() : ''
      };

      console.log('상품 등록 요청:', requestBody);

      const result = await apiFetchJson('/api/products', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });

      console.log('응답 데이터:', result);

      if (!result.success) {
        // 서버에서 에러 응답
        let errorMessage = result.message || '서버 오류가 발생했습니다.';
        
        // 상세 에러 정보가 있으면 추가
        if (result.error) {
          errorMessage += ` - ${result.error}`;
        }
        
        // 검증 오류가 있으면 표시
        if (result.errors && Array.isArray(result.errors)) {
          errorMessage += `\n${result.errors.join(', ')}`;
        }
        
        // 개발 모드에서 상세 에러 표시
        if (result.errorDetails) {
          console.error('서버 에러 상세:', result.errorDetails);
        }
        
        setMessage(errorMessage);
        setIsLoading(false);
        return;
      }

      if (result.success) {
        setMessage('상품이 성공적으로 등록되었습니다!');
        // 폼 초기화
        setFormData({
          sku: '',
          name: '',
          price: '',
          category: '',
          image: '',
          description: ''
        });
        setImagePreview('');
        // 2초 후 어드민 페이지로 돌아가기
        setTimeout(() => {
          if (onBack) onBack();
        }, 2000);
      } else {
        setMessage(result.message || '상품 등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('상품 등록 오류 상세:', error);
      console.error('오류 타입:', error.name);
      console.error('오류 메시지:', error.message);
      console.error('오류 스택:', error.stack);
      
      // 네트워크 오류인지 확인
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        setMessage('서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.');
      } else {
        setMessage(`상품 등록 중 오류가 발생했습니다: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const openCloudinaryWidget = () => {
    if (!cloudName || !uploadPreset) {
      setMessage('Cloudinary 설정이 필요합니다. VITE_CLOUDINARY_CLOUD_NAME과 VITE_CLOUDINARY_UPLOAD_PRESET을 설정해주세요.');
      return;
    }

    if (!window.cloudinary) {
      setMessage('Cloudinary 위젯을 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName,
        uploadPreset,
        sources: ['local', 'url', 'camera'],
        multiple: false,
        maxFiles: 1,
        folder: 'products',
        tags: ['shopping-mall-demo']
      },
      (error, result) => {
        if (!error && result && result.event === 'success') {
          const secureUrl = result.info.secure_url;
          setFormData((prev) => ({
            ...prev,
            image: secureUrl
          }));
          setImagePreview(secureUrl);
          setMessage('이미지가 업로드되었습니다.');
        } else if (error) {
          console.error('Cloudinary 업로드 오류:', error);
          setMessage('이미지 업로드 중 오류가 발생했습니다. 다시 시도해주세요.');
        }
      }
    );

    widget.open();
  };

  return (
    <div className="product-register-page">
      <div className="register-header">
        <h1>새 상품 등록</h1>
        <p className="register-subtitle">상품 정보를 입력하여 새 상품을 등록하세요</p>
      </div>

      <form onSubmit={handleSubmit} className="register-form">
        <div className="form-group">
          <label htmlFor="sku">
            SKU <span className="required">*</span>
          </label>
          <input
            type="text"
            id="sku"
            name="sku"
            value={formData.sku}
            onChange={handleChange}
            placeholder="예: PROD-001"
            required
            className="form-input"
          />
          <p className="form-hint">SKU는 유니크해야 하며, 자동으로 대문자로 변환됩니다.</p>
        </div>

        <div className="form-group">
          <label htmlFor="name">
            상품명 <span className="required">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="상품명을 입력하세요"
            required
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="price">
            가격 <span className="required">*</span>
          </label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="0"
            min="0"
            step="1"
            required
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="category">
            카테고리 <span className="required">*</span>
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="form-select"
          >
            <option value="">카테고리를 선택하세요</option>
            <option value="상의">상의</option>
            <option value="하의">하의</option>
            <option value="악세사리">악세사리</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="image">
            이미지 URL <span className="required">*</span>
          </label>
          <input
            type="url"
            id="image"
            name="image"
            value={formData.image}
            onChange={handleChange}
            placeholder="https://res.cloudinary.com/.../image.jpg"
            required
            className="form-input"
          />
          <p className="form-hint">Cloudinary 또는 이미지 호스팅 서비스의 URL을 입력하세요.</p>
          <div className="image-upload-actions">
            <button
              type="button"
              className="cloudinary-button"
              onClick={openCloudinaryWidget}
            >
              Cloudinary 위젯으로 업로드
            </button>
            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt="상품 이미지 미리보기" />
              </div>
            )}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="description">설명</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="상품 설명을 입력하세요 (선택사항)"
            rows="4"
            className="form-textarea"
          />
        </div>

        <button 
          type="submit" 
          className="submit-btn"
          disabled={isLoading}
        >
          {isLoading ? '등록 중...' : '상품 등록'}
        </button>

        {message && (
          <div className={`message ${message.includes('성공') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}
      </form>

      <div className="register-footer">
        <button onClick={onBack} className="back-button">
          ← 어드민 페이지로 돌아가기
        </button>
      </div>
    </div>
  );
}

export default ProductRegisterPage;
