require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const net = require('net');

const app = express();
// 클라이언트 프록시 설정과 일치하도록 5004 포트 우선 사용
const DEFAULT_PORT = parseInt(process.env.PORT) || 5004;
// MongoDB Atlas URL을 우선 사용하고, 없을 경우 로컬 주소 사용
const MONGO_URI = process.env.MONGODB_ATLAS_URL || process.env.MONGODB_ATLAS_URL || process.env.MONGO_URI || 'mongodb://localhost:27017/shoping-mall';

// 포트가 사용 가능한지 확인하는 함수
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.once('close', () => resolve(true));
      server.close();
    });
    server.on('error', () => resolve(false));
  });
}

// 사용 가능한 포트 찾기
async function findAvailablePort(startPort) {
  for (let port = startPort; port < startPort + 10; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  return null;
}

// CORS 설정
const allowedOrigins = [
  'http://localhost:5173', // 개발 환경 (Vite 기본 포트)
  process.env.CLIENT_URL, // 프로덕션 Client URL (환경 변수)
].filter(Boolean); // undefined 제거

app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // 개발 환경에서는 모든 origin 허용, 프로덕션에서는 허용된 origin만
  if (process.env.NODE_ENV === 'development' || allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin || '*');
  } else if (allowedOrigins.length > 0) {
    // 프로덕션 환경에서 허용되지 않은 origin은 첫 번째 허용된 origin 사용
    res.header('Access-Control-Allow-Origin', allowedOrigins[0]);
  } else {
    // 허용된 origin이 없으면 모든 origin 허용 (임시)
    res.header('Access-Control-Allow-Origin', '*');
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB 연결 성공');
    console.log(`데이터베이스: ${MONGO_URI}`);
  })
  .catch((err) => {
    console.error('MongoDB 연결 실패:', err);
    console.error('MongoDB가 실행 중인지 확인하세요.');
  });

// 라우터 연결
const userRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/carts');
const orderRoutes = require('./routes/orders');
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  next();
});
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/carts', cartRoutes);
app.use('/api/orders', orderRoutes);

app.get('/', (req, res) => {
  res.send('쇼핑몰 데모 서버가 실행 중입니다.');
});

// 전역 에러 핸들러
app.use((err, req, res, next) => {
  console.error('서버 에러:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || '서버 오류가 발생했습니다.',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// 404 핸들러
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: '요청한 경로를 찾을 수 없습니다.'
  });
});

// 서버 시작 함수
async function startServer() {
  let PORT = DEFAULT_PORT;
  
  // 포트가 사용 가능한지 확인
  if (!(await isPortAvailable(PORT))) {
    console.warn(`⚠️  포트 ${PORT}가 이미 사용 중입니다. 다른 포트를 찾는 중...`);
    const availablePort = await findAvailablePort(PORT + 1);
    
    if (availablePort) {
      PORT = availablePort;
      console.warn(`✅ 포트 ${availablePort}를 사용합니다.`);
      console.warn(`💡 기본 포트 ${DEFAULT_PORT}를 사용하려면 다음 명령을 실행하세요:`);
      console.warn(`   netstat -ano | findstr :${DEFAULT_PORT}`);
      console.warn(`   taskkill /PID <PID값> /F\n`);
    } else {
      console.error(`❌ 사용 가능한 포트를 찾을 수 없습니다 (${PORT}~${PORT + 10}).`);
      console.error(`다음 중 하나를 시도하세요:\n`);
      console.error(`1. 포트를 사용 중인 프로세스를 종료하세요:`);
      console.error(`   netstat -ano | findstr :${DEFAULT_PORT}`);
      console.error(`   taskkill /PID <PID값> /F\n`);
      console.error(`2. 다른 포트를 사용하세요:`);
      console.error(`   .env 파일에 PORT=5001 추가\n`);
      process.exit(1);
    }
  }

  const server = app.listen(PORT, () => {
    console.log(`✅ 서버가 포트 ${PORT}에서 실행 중입니다.`);
    console.log(`   http://localhost:${PORT}`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`\n❌ 포트 ${PORT}가 사용 중입니다.`);
      console.error(`다음 명령으로 프로세스를 확인하세요:`);
      console.error(`   netstat -ano | findstr :${PORT}`);
      process.exit(1);
    } else {
      console.error('서버 시작 오류:', error);
      process.exit(1);
    }
  });

  return server;
}

// 서버 시작
let server;
startServer()
  .then((s) => {
    server = s;
  })
  .catch((error) => {
    console.error('서버 시작 실패:', error);
    process.exit(1);
  });

// 프로세스 종료 시 정리
process.on('SIGTERM', () => {
  console.log('\nSIGTERM 신호 수신. 서버 종료 중...');
  if (server) {
    server.close(() => {
      console.log('서버가 종료되었습니다.');
      mongoose.connection.close(false, () => {
        process.exit(0);
      });
    });
  } else {
    mongoose.connection.close(false, () => {
      process.exit(0);
    });
  }
});

process.on('SIGINT', () => {
  console.log('\nSIGINT 신호 수신. 서버 종료 중...');
  if (server) {
    server.close(() => {
      console.log('서버가 종료되었습니다.');
      mongoose.connection.close(false, () => {
        process.exit(0);
      });
    });
  } else {
    mongoose.connection.close(false, () => {
      process.exit(0);
    });
  }
});

