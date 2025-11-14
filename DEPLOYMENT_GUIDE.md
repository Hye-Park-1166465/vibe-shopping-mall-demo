# 배포 가이드

이 프로젝트는 Client(Vercel)와 Server(CloudType)로 분리 배포됩니다.

## 📋 배포 순서

**중요: Server를 먼저 배포한 후 Client를 배포해야 합니다.**
Server의 배포 URL을 알아야 Client에서 API 엔드포인트를 설정할 수 있습니다.

1. **Server 배포 (CloudType)** → Server URL 획득
2. **Client 배포 (Vercel)** → Client URL 획득
3. **Server CORS 설정 업데이트** → Client URL을 허용하도록 수정

---

## 🚀 1단계: Server 배포 (CloudType)

### 1-1. 배포 전 준비사항

#### MongoDB Atlas 설정
1. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)에 가입 및 클러스터 생성
2. Database Access에서 사용자 생성
3. Network Access에서 IP 주소 추가 (CloudType 서버 IP 또는 0.0.0.0/0)
4. Connect → Drivers에서 Connection String 복사
   - 예: `mongodb+srv://username:password@cluster.mongodb.net/shopping-mall?retryWrites=true&w=majority`

#### 환경 변수 준비
CloudType 배포 시 다음 환경 변수를 설정해야 합니다:

```
MONGODB_ATLAS_URL=mongodb+srv://username:password@cluster.mongodb.net/shopping-mall?retryWrites=true&w=majority
PORT=5004
NODE_ENV=production
```

### 1-2. CloudType 배포 절차

1. **CloudType 계정 생성 및 로그인**
   - [CloudType](https://cloudtype.io/) 접속

2. **새 프로젝트 생성**
   - 프로젝트 이름: `shopping-mall-server`
   - 런타임: Node.js 선택

3. **소스 코드 연결**
   - Git 저장소 연결 또는 파일 업로드
   - **중요**: `server` 폴더만 업로드 (루트가 아닌 server 폴더)

4. **환경 변수 설정**
   - CloudType 대시보드 → 환경 변수 섹션
   - 다음 변수 추가:
     ```
     MONGODB_ATLAS_URL=your_mongodb_atlas_connection_string
     PORT=5004
     NODE_ENV=production
     ```

5. **빌드 및 시작 명령어 설정**
   - 빌드 명령어: (없음 또는 `npm install`)
   - 시작 명령어: `npm start`

6. **배포 실행**
   - 배포 버튼 클릭
   - 배포 완료 후 **Server URL 확인** (예: `https://your-server.cloudtype.app`)

### 1-3. Server 배포 확인
- 브라우저에서 `https://your-server.cloudtype.app` 접속
- "쇼핑몰 데모 서버가 실행 중입니다." 메시지 확인

---

## 🌐 2단계: Client 배포 (Vercel)

### 2-1. 배포 전 준비사항

#### 환경 변수 파일 생성
`client` 폴더에 `.env.production` 파일 생성 (또는 Vercel 대시보드에서 설정):

```
VITE_API_BASE_URL=https://your-server.cloudtype.app
```

**중요**: 위의 `your-server.cloudtype.app`을 1단계에서 획득한 실제 Server URL로 변경하세요.

### 2-2. Vercel 배포 절차

1. **Vercel 계정 생성 및 로그인**
   - [Vercel](https://vercel.com/) 접속
   - GitHub 계정으로 로그인 권장

2. **새 프로젝트 추가**
   - "Add New Project" 클릭
   - Git 저장소 연결 또는 `client` 폴더 업로드

3. **프로젝트 설정**
   - **Root Directory**: `client` 선택 (중요!)
   - **Framework Preset**: Vite 선택
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. **환경 변수 설정**
   - Environment Variables 섹션에서 추가:
     ```
     VITE_API_BASE_URL=https://your-server.cloudtype.app
     ```
   - **중요**: `your-server.cloudtype.app`을 실제 Server URL로 변경

5. **배포 실행**
   - "Deploy" 버튼 클릭
   - 배포 완료 후 **Client URL 확인** (예: `https://your-client.vercel.app`)

### 2-3. Client 코드 수정 필요

현재 Client 코드는 상대 경로(`/api/...`)로 API를 호출하고 있습니다.
프로덕션에서는 환경 변수를 사용하도록 수정해야 합니다.

**수정 방법**: API 호출 부분을 환경 변수를 사용하도록 변경해야 합니다.
자세한 내용은 아래 "코드 수정 사항" 섹션을 참조하세요.

---

## 🔧 3단계: Server CORS 설정 업데이트

Client 배포 후, Server의 CORS 설정을 업데이트해야 합니다.

### 3-1. Server 코드 수정

`server/index.js`의 CORS 설정을 다음과 같이 수정:

```javascript
// CORS 설정
const allowedOrigins = [
  'http://localhost:5173', // 개발 환경
  process.env.CLIENT_URL, // 프로덕션 Client URL
  'https://your-client.vercel.app' // 실제 Client URL
].filter(Boolean);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});
```

### 3-2. CloudType 환경 변수 추가

CloudType 대시보드에서 환경 변수 추가:
```
CLIENT_URL=https://your-client.vercel.app
```

### 3-3. Server 재배포

CloudType에서 재배포 실행

---

## 📝 코드 수정 사항

### Client: API 호출을 환경 변수 기반으로 변경

현재 모든 API 호출이 상대 경로(`/api/...`)로 되어 있습니다.
프로덕션에서는 환경 변수를 사용해야 합니다.

**해결 방법 1: API 유틸리티 함수 생성 (권장)**

`client/src/utils/api.js` 파일 생성:
```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const apiFetch = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  return fetch(url, options);
};
```

그리고 모든 `fetch('/api/...')` 호출을 `apiFetch('/api/...')`로 변경

**해결 방법 2: 각 파일에서 직접 수정**

모든 `fetch('/api/...')` 호출을 다음과 같이 변경:
```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const response = await fetch(`${API_BASE_URL}/api/products`);
```

---

## ✅ 배포 확인 체크리스트

### Server 확인
- [ ] CloudType에서 Server가 정상 실행 중
- [ ] Server URL 접속 시 정상 응답
- [ ] MongoDB Atlas 연결 확인
- [ ] 환경 변수 설정 확인

### Client 확인
- [ ] Vercel에서 Client가 정상 빌드 및 배포됨
- [ ] Client URL 접속 시 정상 표시
- [ ] 환경 변수 설정 확인
- [ ] API 호출이 정상 작동하는지 확인 (브라우저 개발자 도구 Network 탭)

### 통합 확인
- [ ] Client에서 Server API 호출 성공
- [ ] 로그인/회원가입 기능 작동
- [ ] 상품 목록 조회 작동
- [ ] 장바구니 기능 작동
- [ ] 주문 기능 작동

---

## 🐛 문제 해결

### Server 배포 문제

**문제**: MongoDB 연결 실패
- **해결**: MongoDB Atlas의 Network Access에서 IP 주소 추가 확인
- **해결**: Connection String의 사용자명/비밀번호 확인

**문제**: 포트 에러
- **해결**: CloudType에서 PORT 환경 변수 확인 (기본값 5004)

### Client 배포 문제

**문제**: API 호출 실패 (CORS 에러)
- **해결**: Server의 CORS 설정에 Client URL 추가 확인
- **해결**: 브라우저 콘솔에서 실제 요청 URL 확인

**문제**: 빌드 실패
- **해결**: Vercel의 Root Directory가 `client`로 설정되었는지 확인
- **해결**: `package.json`의 빌드 스크립트 확인

**문제**: 환경 변수 미적용
- **해결**: Vercel에서 환경 변수 이름이 `VITE_`로 시작하는지 확인
- **해결**: 재배포 실행

---

## 📚 참고 자료

- [Vercel 배포 가이드](https://vercel.com/docs)
- [CloudType 문서](https://docs.cloudtype.io/)
- [MongoDB Atlas 가이드](https://docs.atlas.mongodb.com/)
- [Vite 환경 변수](https://vitejs.dev/guide/env-and-mode.html)

