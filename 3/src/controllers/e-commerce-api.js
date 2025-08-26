// controllers/e-commerce-api.js
const express = require('express');
const router = express.Router();

class ECommerceAPI {
  constructor() {
    this.setupRoutes();
  }

  setupRoutes() {
    // 상품 관련 API
    router.get('/api/products', this.getProducts.bind(this));
    router.get('/api/products/:id', this.getProduct.bind(this));
    router.post('/api/products', this.createProduct.bind(this));
    router.put('/api/products/:id', this.updateProduct.bind(this));
    router.delete('/api/products/:id', this.deleteProduct.bind(this));

    // 주문 관련 API
    router.post('/api/orders', this.createOrder.bind(this));
    router.get('/api/orders/:id', this.getOrder.bind(this));
    router.get('/api/users/:userId/orders', this.getUserOrders.bind(this));
    router.patch('/api/orders/:id/status', this.updateOrderStatus.bind(this));

    // 사용자 관련 API
    router.post('/api/auth/login', this.login.bind(this));
    router.post('/api/auth/register', this.register.bind(this));
    router.get('/api/users/profile', this.getProfile.bind(this));
    router.put('/api/users/profile', this.updateProfile.bind(this));
  }

  async getProducts(req, res) {
    const {
      page = 1,
      limit = 20,
      category,
      minPrice,
      maxPrice,
      sort = 'createdAt',
      order = 'desc',
      search,
    } = req.query;

    // 실제로는 데이터베이스에서 조회
    const products = [
      {
        id: 1,
        name: '스마트폰',
        description: '최신 스마트폰입니다',
        price: 800000,
        category: 'electronics',
        stock: 50,
        images: ['image1.jpg', 'image2.jpg'],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
    ];

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: 100,
          totalPages: 5,
          hasNext: true,
          hasPrev: false,
        },
        filters: {
          category,
          minPrice,
          maxPrice,
          search,
        },
      },
    });
  }

  async createOrder(req, res) {
    const { items, shippingAddress, paymentMethod, couponCode } = req.body;
    const userId = req.user?.id; // 인증 미들웨어에서 설정

    // 입력 검증
    if (!items || !items.length) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_ITEMS',
        message: '주문 상품이 필요합니다',
      });
    }

    if (!shippingAddress || !shippingAddress.address) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_SHIPPING_ADDRESS',
        message: '배송 주소가 필요합니다',
      });
    }

    // 주문 생성 로직
    const order = {
      id: Math.floor(Math.random() * 10000),
      userId,
      items: items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.price * item.quantity,
      })),
      subtotal: items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      ),
      shippingFee: 3000,
      discount: couponCode ? 5000 : 0,
      total: 0,
      shippingAddress,
      paymentMethod,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    order.total = order.subtotal + order.shippingFee - order.discount;

    res.status(201).json({
      success: true,
      message: '주문이 성공적으로 생성되었습니다',
      data: { order },
    });
  }

  async login(req, res) {
    const { email, password, rememberMe } = req.body;

    // 인증 로직 (실제로는 데이터베이스와 비교)
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_CREDENTIALS',
        message: '이메일과 비밀번호가 필요합니다',
      });
    }

    // 가상의 JWT 토큰 생성
    const token = 'jwt-token-example';
    const refreshToken = rememberMe ? 'refresh-token-example' : null;

    res.json({
      success: true,
      message: '로그인 성공',
      data: {
        user: {
          id: 1,
          email,
          name: '김철수',
          role: 'customer',
        },
        tokens: {
          accessToken: token,
          refreshToken,
          expiresIn: rememberMe ? 2592000 : 3600, // 30일 또는 1시간
        },
      },
    });
  }
}

module.exports = { ECommerceAPI };
