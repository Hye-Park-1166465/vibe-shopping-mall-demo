# 배포 체크리스트

## 🚀 빠른 배포 가이드

### 배포 순서 (중요!)

1. **Server 배포 (CloudType)** → URL 획득
2. **Client 코드 수정** → API 호출을 환경 변수 기반으로 변경
3. **Client 배포 (Vercel)** → URL 획득
4. **Server CORS 업데이트** → Client URL 추가 후 재배포

---

## ✅ 1단계: Server 배포 전 준비

### 필수 준비사항
- [ ] MongoDB Atlas 계정 생성 및 클러스터 생성
- [ ] MongoDB Atlas에서 Connection String 복사
- [ ] CloudType 계정 생성

### Server 코드 확인
- [x] CORS 설정 개선 완료 (`server/index.js`)
- [x] 환경 변수 사용 준비 완료

### CloudType 배포 설정
- [ ] 프로젝트 생성 (이름: `shopping-mall-server`)
- [ ] 소스 코드 연결 (`server` 폴더만)
- [ ] 환경 변수 설정:
  ```
  MONGODB_ATLAS_URL=your_mongodb_atlas_connection_string
  PORT=5004
  NODE_ENV=production
  ```
- [ ] 빌드 명령어: (없음 또는 `npm install`)
- [ ] 시작 명령어: `npm start`
- [ ] 배포 실행
- [ ] **Server URL 확인 및 기록**: `https://your-server.cloudtype.app`

---

## ✅ 2단계: Client 코드 수정

### API 유틸리티 함수 생성
- [x] `client/src/utils/api.js` 생성 완료

### 모든 파일에 API 호출 변경
- [x] `client/src/pages/MainPage.jsx` - 완료 (예시)
- [ ] `client/src/pages/Navbar.jsx`
- [ ] `client/src/pages/CartPage.jsx`
- [ ] `client/src/pages/CheckoutPage.jsx`
- [ ] `client/src/pages/ProductDetailPage.jsx`
- [ ] `client/src/pages/LoginPage.jsx`
- [ ] `client/src/pages/RegisterPage.jsx`
- [ ] `client/src/pages/OrderListPage.jsx`
- [ ] `client/src/pages/MyOrdersPage.jsx`
- [ ] `client/src/pages/admin/AdminPage.jsx`
- [ ] `client/src/pages/admin/ProductManagePage.jsx`
- [ ] `client/src/pages/admin/ProductRegisterPage.jsx`
- [ ] `client/src/pages/admin/OrderManagePage.jsx`

**변경 방법**: `CLIENT_MIGRATION_GUIDE.md` 참조

---

## ✅ 3단계: Client 배포 전 준비

### 환경 변수 준비
- [ ] Vercel에서 설정할 환경 변수 준비:
  ```
  VITE_API_BASE_URL=https://your-server.cloudtype.app
  ```
  (위의 URL을 1단계에서 획득한 실제 Server URL로 변경)

### Vercel 배포 설정
- [ ] Vercel 계정 생성
- [ ] 새 프로젝트 추가
- [ ] Root Directory: `client` 선택
- [ ] Framework Preset: Vite
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `dist`
- [ ] 환경 변수 추가:
  ```
  VITE_API_BASE_URL=https://your-server.cloudtype.app
  ```
- [ ] 배포 실행
- [ ] **Client URL 확인 및 기록**: `https://your-client.vercel.app`

---

## ✅ 4단계: Server CORS 업데이트

### CloudType 환경 변수 추가
- [ ] CloudType 대시보드에서 환경 변수 추가:
  ```
  CLIENT_URL=https://your-client.vercel.app
  ```
  (위의 URL을 3단계에서 획득한 실제 Client URL로 변경)

### Server 재배포
- [ ] CloudType에서 재배포 실행
- [ ] Server가 정상 실행되는지 확인

---

## ✅ 5단계: 최종 확인

### 기능 테스트
- [ ] Client 접속 확인
- [ ] 상품 목록 조회 확인
- [ ] 회원가입 기능 확인
- [ ] 로그인 기능 확인
- [ ] 장바구니 기능 확인
- [ ] 주문 기능 확인
- [ ] 관리자 기능 확인

### 에러 확인
- [ ] 브라우저 콘솔 에러 확인
- [ ] Network 탭에서 API 호출 확인
- [ ] CORS 에러 없는지 확인

---

## 📝 환경 변수 요약

### Server (CloudType)
```
MONGODB_ATLAS_URL=mongodb+srv://...
PORT=5004
NODE_ENV=production
CLIENT_URL=https://your-client.vercel.app
```

### Client (Vercel)
```
VITE_API_BASE_URL=https://your-server.cloudtype.app
```

---

## 🐛 문제 해결

### Server 문제
- MongoDB 연결 실패 → Atlas Network Access 확인
- 포트 에러 → PORT 환경 변수 확인

### Client 문제
- API 호출 실패 → 환경 변수 확인, Server URL 확인
- CORS 에러 → Server의 CLIENT_URL 환경 변수 확인
- 빌드 실패 → Root Directory가 `client`인지 확인

---

## 📚 참고 문서

- 상세 가이드: `DEPLOYMENT_GUIDE.md`
- Client 마이그레이션: `CLIENT_MIGRATION_GUIDE.md`

