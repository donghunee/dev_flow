// src/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

// 미들웨어 설정
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 사용자 데이터 (실제로는 데이터베이스)
let users = [
  { id: 1, name: '김개발', email: 'kim@example.com', role: 'admin' },
  { id: 2, name: '이테스트', email: 'lee@example.com', role: 'user' },
];
let nextId = 3;

// 사용자 목록 조회
app.get('/api/users', (req, res) => {
  const { role, page = 1, limit = 10 } = req.query;

  let filteredUsers = users;

  // 역할별 필터링
  if (role) {
    filteredUsers = users.filter((user) => user.role === role);
  }

  // 페이지네이션
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  res.json({
    success: true,
    data: {
      users: paginatedUsers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: filteredUsers.length,
        totalPages: Math.ceil(filteredUsers.length / limit),
      },
    },
  });
});

// 사용자 상세 조회
app.get('/api/users/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  const user = users.find((u) => u.id === userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'USER_NOT_FOUND',
        message: '사용자를 찾을 수 없습니다',
      },
    });
  }

  res.json({
    success: true,
    data: { user },
  });
});

// 사용자 생성
app.post('/api/users', (req, res) => {
  const { name, email, role = 'user' } = req.body;

  // 입력 검증
  if (!name || !email) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'name과 email은 필수입니다',
        details: {
          name: !name ? '이름을 입력해주세요' : null,
          email: !email ? '이메일을 입력해주세요' : null,
        },
      },
    });
  }

  // 이메일 중복 확인
  const existingUser = users.find((u) => u.email === email);
  if (existingUser) {
    return res.status(409).json({
      success: false,
      error: {
        code: 'EMAIL_ALREADY_EXISTS',
        message: '이미 존재하는 이메일입니다',
      },
    });
  }

  const newUser = {
    id: nextId++,
    name,
    email,
    role,
  };

  users.push(newUser);

  res.status(201).json({
    success: true,
    data: { user: newUser },
  });
});

// 사용자 수정
app.put('/api/users/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  const { name, email, role } = req.body;

  const userIndex = users.findIndex((u) => u.id === userId);
  if (userIndex === -1) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'USER_NOT_FOUND',
        message: '사용자를 찾을 수 없습니다',
      },
    });
  }

  // 이메일 중복 확인 (자기 자신 제외)
  if (email) {
    const existingUser = users.find(
      (u) => u.email === email && u.id !== userId
    );
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'EMAIL_ALREADY_EXISTS',
          message: '이미 존재하는 이메일입니다',
        },
      });
    }
  }

  // 업데이트
  if (name) users[userIndex].name = name;
  if (email) users[userIndex].email = email;
  if (role) users[userIndex].role = role;

  res.json({
    success: true,
    data: { user: users[userIndex] },
  });
});

// 사용자 삭제
app.delete('/api/users/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  const userIndex = users.findIndex((u) => u.id === userId);

  if (userIndex === -1) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'USER_NOT_FOUND',
        message: '사용자를 찾을 수 없습니다',
      },
    });
  }

  users.splice(userIndex, 1);

  res.json({
    success: true,
    message: '사용자가 삭제되었습니다',
  });
});

if (process.env.NODE_ENV === 'test') {
  app.get('/__test/error', (req, res) => {
    throw new Error('simulated failure');
  });
}

// 에러 핸들러
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: '서버 내부 오류가 발생했습니다',
    },
  });
});

// 404 핸들러
app.use((req, res, next) => {
  if (
    process.env.NODE_ENV === 'test' &&
    req.path &&
    req.path.startsWith('/__test')
  ) {
    return next();
  }

  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: '요청한 리소스를 찾을 수 없습니다',
    },
  });
});

const PORT = process.env.PORT || 3000;

// 테스트 환경에서는 서버 자동 시작 안함
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 서버가 http://localhost:${PORT}에서 실행 중입니다`);
  });
}

module.exports = app;
