import { useState, useEffect } from 'react';
import { apiFetchJson } from '../../utils/api';
import './ProductManagePage.css';

function ProductManagePage({ onBack, onProductRegister }) {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    totalPages: 1,
    totalProducts: 0,
    hasNextPage: false,
    hasPrevPage: false
  });

  useEffect(() => {
    fetchProducts(currentPage);
  }, [currentPage]);

  const fetchProducts = async (page = 1) => {
    try {
      setIsLoading(true);
      setMessage(''); // 이전 메시지 초기화
      
      console.log(`상품 목록 가져오기: page=${page}, limit=2`);
      const result = await apiFetchJson(`/api/products?page=${page}&limit=2`);
      console.log('응답 데이터:', result);

      if (result.success) {
        setProducts(result.data || []);
        if (result.pagination) {
          setPagination(result.pagination);
        }
        console.log(`상품 ${result.data?.length || 0}개 로드됨, 총 ${result.pagination?.totalProducts || 0}개`);
      } else {
        const errorMessage = result.message || '알 수 없는 오류';
        console.error('API 응답 오류:', errorMessage);
        setMessage(`상품 목록을 불러오는데 실패했습니다: ${errorMessage}`);
        setTimeout(() => setMessage(''), 5000);
      }
    } catch (error) {
      console.error('상품 목록 가져오기 오류:', error);
      console.error('오류 상세:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      // 네트워크 오류인지 확인
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        setMessage('서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.');
      } else {
        setMessage(`상품 목록을 불러오는데 실패했습니다: ${error.message}`);
      }
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('정말로 이 상품을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const result = await apiFetchJson(`/api/products/${productId}`, {
        method: 'DELETE'
      });

      if (result.success) {
        setMessage('상품이 삭제되었습니다.');
        // 현재 페이지의 상품이 모두 삭제되었고, 이전 페이지가 있으면 이전 페이지로 이동
        if (products.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        } else {
          fetchProducts(currentPage); // 목록 새로고침
        }
        // 3초 후 메시지 제거
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(result.message || '상품 삭제에 실패했습니다.');
        setTimeout(() => setMessage(''), 5000);
      }
    } catch (error) {
      console.error('상품 삭제 오류:', error);
      setMessage('상품 삭제 중 오류가 발생했습니다.');
      setTimeout(() => setMessage(''), 5000);
    }
  };

  return (
    <div className="product-manage-page">
      <header className="manage-header">
        <div className="header-content">
          <div className="header-text">
            <h1>상품 관리</h1>
            <p className="manage-subtitle">등록된 상품을 관리하세요</p>
          </div>
          <button 
            type="button"
            className="add-product-btn"
            onClick={onProductRegister}
          >
            + 새 상품 등록
          </button>
        </div>
      </header>

      {message && (
        <div className={`message ${message.includes('성공') || message.includes('삭제') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <div className="manage-content">
        {isLoading ? (
          <div className="loading">로딩 중...</div>
        ) : message && message.includes('실패') ? (
          <div className="empty-state">
            <p>⚠️ {message}</p>
            <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '8px' }}>
              브라우저 개발자 도구(F12)의 콘솔 탭에서 상세 오류를 확인하세요.
            </p>
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <p>등록된 상품이 없습니다.</p>
            <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '8px' }}>
              상품을 등록하려면 위의 &quot;+ 새 상품 등록&quot; 버튼을 클릭하세요.
            </p>
          </div>
        ) : (
          <div className="products-table">
            <table>
              <thead>
                <tr>
                  <th>이미지</th>
                  <th>SKU</th>
                  <th>상품명</th>
                  <th>카테고리</th>
                  <th>가격</th>
                  <th>등록일</th>
                  <th>작업</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id}>
                    <td>
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="product-thumbnail"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/50';
                        }}
                      />
                    </td>
                    <td>{product.sku}</td>
                    <td>{product.name}</td>
                    <td>{product.category}</td>
                    <td>{product.price.toLocaleString()}원</td>
                    <td>{new Date(product.createdAt).toLocaleDateString('ko-KR')}</td>
                    <td>
                      <button
                        type="button"
                        className="delete-btn"
                        onClick={() => handleDelete(product._id)}
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 페이지네이션 */}
        {!isLoading && products.length > 0 && pagination.totalPages > 1 && (
          <div className="pagination">
            <button
              type="button"
              className="pagination-btn"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!pagination.hasPrevPage}
            >
              이전
            </button>
            <div className="pagination-info">
              <span className="page-numbers">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    className={`page-number ${currentPage === pageNum ? 'active' : ''}`}
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </button>
                ))}
              </span>
              <span className="page-info">
                {currentPage} / {pagination.totalPages} 페이지 (총 {pagination.totalProducts}개)
              </span>
            </div>
            <button
              type="button"
              className="pagination-btn"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!pagination.hasNextPage}
            >
              다음
            </button>
          </div>
        )}
      </div>

      <div className="manage-footer">
        <button onClick={onBack} className="back-button">
          ← 어드민 페이지로 돌아가기
        </button>
      </div>
    </div>
  );
}

export default ProductManagePage;
