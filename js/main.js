const API_URL = 'http://localhost:5000/api';
let allProducts = [];
let currentTab = 'all';

async function loadProducts() {
  const grid = document.getElementById('productGrid');
  grid.innerHTML = Array(8).fill('<div class="skeleton"></div>').join('');

  const res = await fetch(`${API_URL}/products`);
  allProducts = await res.json();
  renderProducts(allProducts);
}

function renderProducts(products) {
  const grid = document.getElementById('productGrid');
  if (products.length === 0) {
    grid.innerHTML = '<p>មិនទាន់មានទំនិញនៅឡើយទេ</p>';
    return;
  }

  const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');

  grid.innerHTML = products.map((p, i) => {
    const isWished = wishlist.includes(p._id);
    const finalPrice = p.discount > 0 ? (p.price - (p.price * p.discount / 100)).toFixed(2) : p.price.toFixed(2);
    const tagLabel = { new: 'New', bestseller: 'Best Seller', flashsale: 'Flash Sale' }[p.tag];

    return `
    <div class="product-card" style="animation-delay:${i * 0.05}s">
      <div class="product-img-wrap">
        <a href="product.html?id=${p._id}">
          <img src="http://localhost:5000${p.image}" onerror="this.src='https://via.placeholder.com/250x280?text=No+Image'">
        </a>
        ${tagLabel ? `<span class="badge-tag badge-${p.tag}">${tagLabel}</span>` : ''}
        ${p.discount > 0 ? `<span class="discount-badge">-${p.discount}%</span>` : ''}
        <button class="wishlist-btn ${isWished ? 'active' : ''}" onclick="toggleWishlist('${p._id}', this)">
          <i class="fa-solid fa-heart"></i>
        </button>
      </div>
      <div class="product-info">
        <span class="category">${p.category}</span>
        <a href="product.html?id=${p._id}"><h3>${p.name}</h3></a>
        <div class="rating">${'★'.repeat(Math.round(p.rating))}${'☆'.repeat(5 - Math.round(p.rating))} <span style="color:var(--gray)">(${p.rating})</span></div>
        <div class="price-row">
          <span class="price">$${finalPrice}</span>
          ${p.discount > 0 ? `<span class="old-price">$${p.price.toFixed(2)}</span>` : ''}
        </div>
        <button class="add-cart-btn" onclick='quickAddToCart(${JSON.stringify(p)})'>🛒 Add to Cart</button>
      </div>
    </div>`;
  }).join('');
}

function filterTab(tag, btn) {
  currentTab = tag;
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const filtered = tag === 'all' ? allProducts : allProducts.filter(p => p.tag === tag);
  renderProducts(filtered);
}

function searchProducts() {
  const q = document.getElementById('searchInput').value.toLowerCase();
  const filtered = allProducts.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
  renderProducts(filtered);
}

function filterCategory(cat, el) {
  document.querySelectorAll('.cat-chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  const filtered = cat === 'all' ? allProducts : allProducts.filter(p => p.category.toLowerCase() === cat.toLowerCase());
  renderProducts(filtered);
}

function toggleWishlist(id, btn) {
  let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
  if (wishlist.includes(id)) {
    wishlist = wishlist.filter(w => w !== id);
    btn.classList.remove('active');
  } else {
    wishlist.push(id);
    btn.classList.add('active');
  }
  localStorage.setItem('wishlist', JSON.stringify(wishlist));
  updateWishlistCount();
}

function quickAddToCart(product) {
  let cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const existing = cart.find(item => item._id === product._id);
  if (existing) existing.qty += 1;
  else cart.push({ ...product, qty: 1 });
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  alert('✅ បានដាក់ចូលកន្ត្រកជោគជ័យ!');
}

function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const el = document.getElementById('cartCount');
  if (el) el.textContent = cart.reduce((s, i) => s + i.qty, 0);
}

function updateWishlistCount() {
  const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
  const el = document.getElementById('wishlistCount');
  if (el) el.textContent = wishlist.length;
}

// Dark mode
function toggleDarkMode() {
  document.body.classList.toggle('dark');
  localStorage.setItem('darkMode', document.body.classList.contains('dark'));
}
if (localStorage.getItem('darkMode') === 'true') document.body.classList.add('dark');

loadProducts();
updateCartCount();
updateWishlistCount();