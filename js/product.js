const API_URL = 'http://localhost:5000/api';
const params = new URLSearchParams(window.location.search);
const productId = params.get('id');

async function loadProduct() {
  const res = await fetch(`${API_URL}/products/${productId}`);
  const p = await res.json();
  const container = document.getElementById('productDetail');

  container.innerHTML = `
    <img src="http://localhost:5000${p.image}" onerror="this.src='https://via.placeholder.com/400x400?text=No+Image'">
    <div class="product-detail-info">
      <h1>${p.name}</h1>
      <div class="rating">${'★'.repeat(Math.round(p.rating))}${'☆'.repeat(5 - Math.round(p.rating))} (${p.rating})</div>
      <div class="price" style="font-size:24px; font-weight:700; color:var(--primary); margin:10px 0;">$${(p.price - (p.price*p.discount/100)).toFixed(2)} ${p.discount>0 ? `<span class="old-price">$${p.price.toFixed(2)}</span>` : ''}</div>
      <p style="color:var(--gray); margin-bottom:14px;">${p.description || ''}</p>
      <p><strong>ពណ៌:</strong> ${p.color || '-'}</p>
      <p><strong>ទំហំ:</strong> ${p.size.join(', ') || '-'}</p>
      <p><strong>នៅសល់ក្នុងស្តុក:</strong> ${p.stock}</p>
      <select id="qty" class="qty-select">
        ${Array.from({length: Math.min(p.stock,10)||1}, (_, i) => `<option value="${i+1}">${i+1}</option>`).join('')}
      </select><br>
      <button class="btn" onclick='addToCart(${JSON.stringify(p)})'>➕ ដាក់ចូលកន្ត្រក</button>
    </div>
  `;

  saveRecentlyViewed(p);
  loadSimilarProducts(p.category, p._id);
  renderRecentlyViewed(p._id);
}

function addToCart(product) {
  const qty = parseInt(document.getElementById('qty').value);
  let cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const existing = cart.find(item => item._id === product._id);
  if (existing) existing.qty += qty;
  else cart.push({ ...product, qty });
  localStorage.setItem('cart', JSON.stringify(cart));
  alert('✅ បានដាក់ចូលកន្ត្រកជោគជ័យ!');
  window.location.href = 'cart.html';
}

// ---- Similar Products (តាម category) ----
async function loadSimilarProducts(category, currentId) {
  const res = await fetch(`${API_URL}/products`);
  const all = await res.json();
  const similar = all.filter(p => p.category === category && p._id !== currentId).slice(0, 4);

  const container = document.getElementById('similarProducts');
  if (!container) return;

  if (similar.length === 0) {
    container.innerHTML = '<p>មិនមានទំនិញស្រដៀងគ្នា</p>';
    return;
  }

  container.innerHTML = similar.map(p => `
    <div class="product-card">
      <div class="product-img-wrap">
        <a href="product.html?id=${p._id}"><img src="http://localhost:5000${p.image}" onerror="this.src='https://via.placeholder.com/250'"></a>
      </div>
      <div class="product-info">
        <span class="category">${p.category}</span>
        <a href="product.html?id=${p._id}"><h3>${p.name}</h3></a>
        <div class="price-row"><span class="price">$${p.price.toFixed(2)}</span></div>
      </div>
    </div>
  `).join('');
}

// ---- Recently Viewed (localStorage) ----
function saveRecentlyViewed(product) {
  let viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
  viewed = viewed.filter(p => p._id !== product._id);
  viewed.unshift(product);
  viewed = viewed.slice(0, 8);
  localStorage.setItem('recentlyViewed', JSON.stringify(viewed));
}

function renderRecentlyViewed(currentId) {
  const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]').filter(p => p._id !== currentId);
  const container = document.getElementById('recentlyViewed');
  if (!container) return;

  if (viewed.length === 0) {
    container.parentElement.style.display = 'none';
    return;
  }

  container.innerHTML = viewed.slice(0, 4).map(p => `
    <div class="product-card">
      <div class="product-img-wrap">
        <a href="product.html?id=${p._id}"><img src="http://localhost:5000${p.image}" onerror="this.src='https://via.placeholder.com/250'"></a>
      </div>
      <div class="product-info">
        <span class="category">${p.category}</span>
        <a href="product.html?id=${p._id}"><h3>${p.name}</h3></a>
        <div class="price-row"><span class="price">$${p.price.toFixed(2)}</span></div>
      </div>
    </div>
  `).join('');
}

loadProduct();