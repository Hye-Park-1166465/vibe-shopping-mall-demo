# Client API 호출 마이그레이션 가이드

프로덕션 배포를 위해 모든 API 호출을 `apiFetch` 유틸리티 함수를 사용하도록 변경해야 합니다.

## 변경 방법

### 1. 기존 코드 (변경 전)
```javascript
const response = await fetch('/api/products');
const result = await response.json();
```

### 2. 새로운 코드 (변경 후)
```javascript
import { apiFetchJson } from '../utils/api';

const result = await apiFetchJson('/api/products');
```

## 변경이 필요한 파일 목록

다음 파일들의 `fetch` 호출을 `apiFetch` 또는 `apiFetchJson`으로 변경해야 합니다:

1. ✅ `client/src/pages/MainPage.jsx` - 완료
2. `client/src/pages/Navbar.jsx`
3. `client/src/pages/CartPage.jsx`
4. `client/src/pages/CheckoutPage.jsx`
5. `client/src/pages/ProductDetailPage.jsx`
6. `client/src/pages/LoginPage.jsx`
7. `client/src/pages/RegisterPage.jsx`
8. `client/src/pages/OrderListPage.jsx`
9. `client/src/pages/MyOrdersPage.jsx`
10. `client/src/pages/admin/AdminPage.jsx`
11. `client/src/pages/admin/ProductManagePage.jsx`
12. `client/src/pages/admin/ProductRegisterPage.jsx`
13. `client/src/pages/admin/OrderManagePage.jsx`

## 변경 예시

### 예시 1: GET 요청
**변경 전:**
```javascript
const response = await fetch('/api/products');
const result = await response.json();
```

**변경 후:**
```javascript
import { apiFetchJson } from '../utils/api';

const result = await apiFetchJson('/api/products');
```

### 예시 2: POST 요청 (body 포함)
**변경 전:**
```javascript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ email, password }),
});
const result = await response.json();
```

**변경 후:**
```javascript
import { apiFetchJson } from '../utils/api';

const result = await apiFetchJson('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email, password }),
});
```

### 예시 3: Authorization 헤더가 필요한 경우
`apiFetch` 함수는 자동으로 `localStorage`에서 토큰을 읽어서 Authorization 헤더를 추가합니다.
따라서 별도로 헤더를 설정할 필요가 없습니다.

**변경 전:**
```javascript
const token = localStorage.getItem('token');
const response = await fetch('/api/carts', {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});
```

**변경 후:**
```javascript
import { apiFetchJson } from '../utils/api';

const result = await apiFetchJson('/api/carts');
// 토큰은 자동으로 추가됩니다
```

### 예시 4: 응답 상태 코드 확인이 필요한 경우
**변경 전:**
```javascript
const response = await fetch('/api/products');
if (!response.ok) {
  throw new Error('Failed to fetch');
}
const result = await response.json();
```

**변경 후:**
```javascript
import { apiFetch } from '../utils/api';

const response = await apiFetch('/api/products');
if (!response.ok) {
  throw new Error('Failed to fetch');
}
const result = await response.json();
```

## 빠른 마이그레이션 스크립트

모든 파일을 한 번에 변경하려면 다음 단계를 따르세요:

1. 각 파일 상단에 import 추가:
   ```javascript
   import { apiFetchJson } from '../utils/api';
   // 또는
   import { apiFetch } from '../utils/api';
   ```

2. `fetch('/api/...')` 패턴을 찾아서 변경:
   - `fetch('/api/...')` → `apiFetch('/api/...')` 또는 `apiFetchJson('/api/...')`
   - `.json()` 호출이 있으면 `apiFetchJson` 사용
   - 응답 상태 확인이 필요하면 `apiFetch` 사용

3. Authorization 헤더 수동 설정 제거:
   - `apiFetch` 함수가 자동으로 처리하므로 제거 가능

## 테스트

변경 후 다음을 확인하세요:

1. 개발 환경에서 정상 작동 확인 (`npm run dev`)
2. 빌드가 성공하는지 확인 (`npm run build`)
3. 프로덕션 환경 변수 설정 후 배포 테스트

