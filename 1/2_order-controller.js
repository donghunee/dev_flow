// Express API 엔드포인트

// order-controller.js
const express = require('express');
const app = express();

app.use(express.json());

// 주문 생성 API
app.post('/api/orders', (req, res) => {
  const { userId, items, paymentMethod, shippingAddress } = req.body;

  let totalPrice = 0;
  for (let item of items) {
    totalPrice += item.price * item.quantity;
  }

  // 할인 적용
  if (req.body.discountCode) {
    if (req.body.discountCode === 'SAVE10') {
      totalPrice = totalPrice * 0.9;
    }
  }

  // 주문 저장 (데이터베이스 로직 생략)
  const order = {
    id: Date.now(),
    userId: userId,
    items: items,
    total: totalPrice,
    status: 'pending',
    createdAt: new Date(),
  };

  res.json(order);
});

// 주문 조회 API
app.get('/api/orders/:id', (req, res) => {
  const orderId = req.params.id;

  // 데이터베이스에서 주문 조회 (가상)
  const order = findOrderById(orderId);

  res.json(order);
});

// 주문 상태 업데이트
app.put('/api/orders/:id/status', (req, res) => {
  const orderId = req.params.id;
  const newStatus = req.body.status;

  // 상태 업데이트 로직
  updateOrderStatus(orderId, newStatus);

  res.json({ success: true });
});

function findOrderById(id) {
  // 실제로는 데이터베이스 조회
  return { id, status: 'completed' };
}

function updateOrderStatus(id, status) {
  // 실제로는 데이터베이스 업데이트
  console.log(`Order ${id} status updated to ${status}`);
}
