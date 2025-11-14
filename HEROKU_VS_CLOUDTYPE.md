# Heroku vs CloudType 배포 차이점

## 주요 차이점

### 1. Procfile 필요 여부

**Heroku:**
- ✅ `Procfile` 파일이 **필수**
- 형식: `web: node index.js`
- Heroku가 이 파일을 읽어서 앱을 시작

**CloudType:**
- ❌ `Procfile` 파일이 **불필요**
- `package.json`의 `start` 스크립트를 자동으로 사용
- 현재 프로젝트: `"start": "node index.js"` 이미 설정됨 ✅

### 2. 포트 설정

**Heroku:**
```javascript
const PORT = process.env.PORT || 5000;
// Heroku가 자동으로 PORT 환경 변수를 설정
```

**CloudType:**
```javascript
const PORT = process.env.PORT || 5004;
// CloudType도 PORT 환경 변수를 자동 설정하지만,
// 명시적으로 환경 변수에서 설정 가능
```
- 현재 코드는 이미 `process.env.PORT`를 사용하므로 문제없음 ✅

### 3. 환경 변수 설정

**Heroku:**
- Heroku CLI: `heroku config:set KEY=value`
- 또는 Heroku 대시보드에서 설정

**CloudType:**
- CloudType 대시보드에서 직접 설정
- `.env` 파일 업로드도 가능

### 4. 빌드 및 배포

**Heroku:**
- Git push 기반 배포
- `git push heroku main`
- 자동 빌드 및 배포

**CloudType:**
- Git 연결 또는 파일 업로드
- 대시보드에서 배포 버튼 클릭
- 자동 빌드 및 배포

### 5. 데이터베이스

**Heroku:**
- Heroku Postgres (PostgreSQL)
- MongoDB는 별도로 MongoDB Atlas 사용

**CloudType:**
- MongoDB Atlas 사용 (동일)
- 다른 데이터베이스도 연결 가능

## 현재 프로젝트 상태

### ✅ CloudType 배포 준비 완료
- [x] `package.json`에 `start` 스크립트 있음
- [x] `process.env.PORT` 사용 중
- [x] 환경 변수 사용 준비 완료
- [x] CORS 설정 개선 완료

### ❌ 불필요한 파일
- `Procfile` - CloudType에서는 필요 없음 (있어도 문제는 없지만 불필요)

## CloudType 배포 시 주의사항

1. **Root Directory 설정**
   - CloudType에서 프로젝트 생성 시
   - Root Directory를 `server` 폴더로 설정해야 함
   - 또는 `server` 폴더만 업로드

2. **환경 변수 설정**
   ```
   MONGODB_ATLAS_URL=mongodb+srv://...
   PORT=5004 (선택사항, 자동 할당 가능)
   NODE_ENV=production
   CLIENT_URL=https://your-client.vercel.app
   ```

3. **빌드 명령어**
   - CloudType에서는 보통 `npm install`만 필요
   - 또는 빈 값 (자동 감지)

4. **시작 명령어**
   - `npm start` (package.json의 start 스크립트 사용)

## 요약

| 항목 | Heroku | CloudType |
|------|--------|-----------|
| Procfile | ✅ 필수 | ❌ 불필요 |
| package.json start | ✅ 사용 가능 | ✅ 사용 (권장) |
| 포트 설정 | process.env.PORT | process.env.PORT |
| 환경 변수 | CLI 또는 대시보드 | 대시보드 |
| 배포 방식 | Git push | Git 또는 파일 업로드 |

**결론**: 현재 프로젝트는 CloudType 배포에 바로 사용 가능합니다. Procfile은 필요 없습니다!

