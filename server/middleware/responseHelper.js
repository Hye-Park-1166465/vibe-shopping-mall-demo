// 공통 응답 헬퍼 함수들

/**
 * 성공 응답 전송
 */
exports.sendSuccess = (res, statusCode = 200, message = null, data = null) => {
  const response = {
    success: true
  };
  
  if (message) response.message = message;
  if (data !== null) response.data = data;
  if (Array.isArray(data)) response.count = data.length;
  
  return res.status(statusCode).json(response);
};

/**
 * 에러 응답 전송
 */
exports.sendError = (res, statusCode = 500, message = '서버 오류가 발생했습니다.', error = null) => {
  const response = {
    success: false,
    message
  };
  
  // 개발 환경에서만 에러 상세 정보 포함
  if (process.env.NODE_ENV === 'development' && error) {
    response.error = error.message || error;
  }
  
  return res.status(statusCode).json(response);
};

