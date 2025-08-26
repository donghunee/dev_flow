// product-manager.js (프론트엔드)
class ProductManager {
  constructor() {
    this.products = [];
    this.currentUser = JSON.parse(localStorage.getItem('user'));
    this.apiKey = 'abc123-def456-ghi789'; // API 키
  }

  // 상품 목록 로드
  async loadProducts() {
    try {
      const response = await fetch('/api/products?key=' + this.apiKey);
      const data = await response.json();

      this.products = data;
      this.renderProducts();
    } catch (error) {
      alert('상품을 불러올 수 없습니다: ' + error.message);
    }
  }

  // 상품 렌더링
  renderProducts() {
    const container = document.getElementById('products');
    let html = '';

    for (let product of this.products) {
      html += `
                <div class="product" onclick="viewProduct(${product.id})">
                    <img src="${product.image}" alt="${product.name}">
                    <h3>${product.name}</h3>
                    <p>${product.description}</p>
                    <span class="price">₩${product.price}</span>
                    ${
                      this.currentUser && this.currentUser.role === 'admin'
                        ? `<button onclick="deleteProduct(${product.id})">삭제</button>`
                        : ''
                    }
                </div>
            `;
    }

    container.innerHTML = html;
  }

  // 상품 검색
  searchProducts(query) {
    const filtered = this.products.filter(
      (product) =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase())
    );

    this.products = filtered;
    this.renderProducts();
  }

  // 장바구니에 추가
  addToCart(productId, quantity = 1) {
    const product = this.products.find((p) => p.id === productId);
    if (!product) return;

    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    const existingItem = cart.find((item) => item.productId === productId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({
        productId: productId,
        name: product.name,
        price: product.price,
        quantity: quantity,
        addedAt: new Date(),
      });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    this.updateCartUI();
  }

  // 장바구니 UI 업데이트
  updateCartUI() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    document.getElementById('cart-count').textContent = totalItems;
    document.getElementById(
      'cart-total'
    ).textContent = `₩${totalPrice.toLocaleString()}`;
  }
}

// 전역 함수들
function viewProduct(id) {
  window.location.href = `/product/${id}`;
}

function deleteProduct(id) {
  if (confirm('정말 삭제하시겠습니까?')) {
    fetch(`/api/products/${id}`, { method: 'DELETE' }).then(() =>
      window.location.reload()
    );
  }
}

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', () => {
  const manager = new ProductManager();
  manager.loadProducts();

  // 검색 이벤트
  document.getElementById('search').addEventListener('input', (e) => {
    manager.searchProducts(e.target.value);
  });
});
