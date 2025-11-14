# Shopping Mall Server

Node.js, Express, MongoDB를 사용한 쇼핑몰 서버 애플리케이션입니다.

## 설치 방법

1. 의존성 설치:
```bash
npm install
```

2. 환경 변수 설정:
`.env` 파일을 생성하고 아래와 같이 작성하세요:
```
MONGO_URI=mongodb://localhost:27017/shoping-mall
PORT=5000
```

3. MongoDB 실행:
로컬 MongoDB를 실행하거나 MongoDB Atlas를 사용하세요.

## 실행 방법

개발용 서버 실행(자동 재시작):
```bash
npm run dev
```

프로덕션 모드 실행:
```bash
npm start
```

서버는 기본적으로 `http://localhost:5000`에서 실행됩니다.

## 프로젝트 구조

```
server/
├── controllers/         # 컨트롤러 파일들
├── middleware/          # 미들웨어 파일들
├── models/              # Mongoose 모델 파일들
├── routes/              # 라우트 파일들
│   └── index.js
├── .env                 # 환경 변수 (git에 포함되지 않음)
├── .gitignore
├── package.json
├── README.md
└── index.js             # Express 앱 진입점
```

## 환경 변수

- `PORT`: 서버 포트 (기본값: 5000)
- `MONGO_URI`: MongoDB 연결 문자열

