function renderCart() {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const container = document.getElementById('cartItems');

  if (cart.length === 0) {
    container.innerHTML = '<p>កន្ត្រករបស់អ្នកនៅទទេ</p>';
    document.getElementById('cartSummary').style.display = 'none';
    return;
  }

  container.innerHTML = cart.map((item, i) => `
    <div class="cart-item">
      <img src="http://localhost:5000${item.image}" onerror="this.src='https://via.placeholder.com/90'">
      <div class="cart-item-info">
        <h3>${item.name}</h3>
        <p style="color:var(--primary); font-weight:700;">$${Number(item.price).toFixed(2)}</p>
      </div>
      <div class="qty-control">
        <button onclick="changeQty(${i}, -1)">−</button>
        <span>${item.qty}</span>
        <button onclick="changeQty(${i}, 1)">+</button>
      </div>
      <button class="btn btn-danger btn-sm" onclick="removeItem(${i})"><i class="fa-solid fa-trash"></i></button>
    </div>
  `).join('');

  calculateSummary();
}

function changeQty(index, delta) {
  let cart = JSON.parse(localStorage.getItem('cart') || '[]');
  cart[index].qty += delta;
  if (cart[index].qty < 1) cart[index].qty = 1;
  localStorage.setItem('cart', JSON.stringify(cart));
  renderCart();
}

function removeItem(index) {
  let cart = JSON.parse(localStorage.getItem('cart') || '[]');
  cart.splice(index, 1);
  localStorage.setItem('cart', JSON.stringify(cart));
  renderCart();
}

let appliedDiscount = 0;
function applyCoupon() {
  const code = document.getElementById('couponInput').value.trim().toUpperCase();
  const validCoupons = { 'SAVE10': 10, 'WELCOME20': 20 };
  if (validCoupons[code]) {
    appliedDiscount = validCoupons[code];
    alert(`✅ Coupon ត្រូវបានប្រើ! បញ្ចុះតម្លៃ ${appliedDiscount}%`);
  } else {
    appliedDiscount = 0;
    alert('❌ Coupon Code មិនត្រឹមត្រូវ');
  }
  calculateSummary();
}

function calculateSummary() {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shipping = subtotal > 50 ? 0 : 3.5;
  const discountAmount = subtotal * (appliedDiscount / 100);
  const total = subtotal - discountAmount + shipping;

  document.getElementById('cartSummary').style.display = 'block';
  document.getElementById('subtotalVal').textContent = `$${subtotal.toFixed(2)}`;
  document.getElementById('shippingVal').textContent = shipping === 0 ? 'ឥតគិតថ្លៃ' : `$${shipping.toFixed(2)}`;
  document.getElementById('discountVal').textContent = `-$${discountAmount.toFixed(2)}`;
  document.getElementById('totalVal').textContent = `$${total.toFixed(2)}`;
}

function goToCheckout() {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  if (cart.length === 0) return alert('កន្ត្រកទទេ!');
  window.location.href = 'checkout.html';
}

renderCart();