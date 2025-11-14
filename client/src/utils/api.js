// API 기본 URL 설정
// 개발 환경: Vite proxy 사용 (빈 문자열)
// 프로덕션: 환경 변수에서 가져온 서버 URL 사용
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

/**
 * API 호출을 위한 fetch 래퍼 함수
 * @param {string} endpoint - API 엔드포인트 (예: '/api/products')
 * @param {object} options - fetch 옵션 (method, headers, body 등)
 * @returns {Promise<Response>} fetch 응답
 */
export const apiFetch = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // 기본 헤더 설정
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  // Authorization 헤더 추가 (토큰이 있는 경우)
  const token = localStorage.getItem('token');
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  // 옵션 병합
  const mergedOptions = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, mergedOptions);
    return response;
  } catch (error) {
    console.error('API 호출 오류:', error);
    throw error;
  }
};

/**
 * JSON 응답을 파싱하는 헬퍼 함수
 * @param {string} endpoint - API 엔드포인트
 * @param {object} options - fetch 옵션
 * @returns {Promise<object>} 파싱된 JSON 응답
 */
export const apiFetchJson = async (endpoint, options = {}) => {
  const response = await apiFetch(endpoint, options);
  const data = await response.json();
  return data;
};

