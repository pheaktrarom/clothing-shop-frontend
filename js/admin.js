const API_URL = 'http://localhost:5000/api';

function getToken() { return localStorage.getItem('adminToken'); }

// ---- TAB SWITCH ----
function switchAdminTab(tab) {
  ['dashboard', 'products', 'orders'].forEach(t => {
    document.getElementById(`tab${capitalize(t)}`).classList.toggle('active', t === tab);
    document.getElementById(`${t}Tab`).style.display = t === tab ? 'block' : 'none';
  });
  if (tab === 'dashboard') loadDashboard();
  if (tab === 'products') loadAdminProducts();
  if (tab === 'orders') loadAdminOrders();
}
function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

// ---- LOGIN ----
async function login(e) {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();

  if (res.ok) {
    localStorage.setItem('adminToken', data.token);
    window.location.href = 'admin.html';
  } else {
    document.getElementById('loginError').textContent = data.message;
  }
}

function logout() {
  localStorage.removeItem('adminToken');
  window.location.reload();
}

// ---- DASHBOARD ----
async function loadDashboard() {
  const res = await fetch(`${API_URL}/dashboard/stats`, {
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });
  const stats = await res.json();
  document.getElementById('statProducts').textContent = stats.totalProducts;
  document.getElementById('statOrders').textContent = stats.totalOrders;
  document.getElementById('statRevenue').textContent = `$${stats.totalRevenue.toFixed(2)}`;
  document.getElementById('statLowStock').textContent = stats.lowStock;
}

// ---- PRODUCTS ----
async function loadAdminProducts() {
  const res = await fetch(`${API_URL}/products`);
  const products = await res.json();
  const tbody = document.getElementById('productTableBody');

  tbody.innerHTML = products.map(p => `
    <tr>
      <td><img src="http://localhost:5000${p.image}" onerror="this.src='https://via.placeholder.com/50'"></td>
      <td>${p.name}</td>
      <td>$${Number(p.price).toFixed(2)}</td>
      <td>${p.category}</td>
      <td>${p.stock <= 5 ? `<span style="color:#ef4444; font-weight:700;">${p.stock} ⚠️</span>` : p.stock}</td>
      <td>
        <button class="btn btn-sm" onclick='editProduct(${JSON.stringify(p)})'>កែ</button>
        <button class="btn btn-danger btn-sm" onclick="deleteProduct('${p._id}')">លុប</button>
      </td>
    </tr>
  `).join('');
}

document.getElementById('productForm')?.addEventListener('submit', async function (e) {
  e.preventDefault();
  const formData = new FormData();
  formData.append('name', document.getElementById('pName').value);
  formData.append('description', document.getElementById('pDesc').value);
  formData.append('price', document.getElementById('pPrice').value);
  formData.append('discount', document.getElementById('pDiscount').value || 0);
  formData.append('rating', document.getElementById('pRating').value || 4.5);
  formData.append('tag', document.getElementById('pTag').value);
  formData.append('category', document.getElementById('pCategory').value);
  formData.append('size', document.getElementById('pSize').value);
  formData.append('color', document.getElementById('pColor').value);
  formData.append('stock', document.getElementById('pStock').value);

  const imageFile = document.getElementById('pImage').files[0];
  if (imageFile) formData.append('image', imageFile);

  const editId = document.getElementById('editId').value;
  const url = editId ? `${API_URL}/products/${editId}` : `${API_URL}/products`;
  const method = editId ? 'PUT' : 'POST';

  const res = await fetch(url, {
    method,
    headers: { 'Authorization': `Bearer ${getToken()}` },
    body: formData
  });

  if (res.ok) {
    alert(editId ? 'កែប្រែជោគជ័យ!' : 'បន្ថែមទំនិញជោគជ័យ!');
    document.getElementById('productForm').reset();
    document.getElementById('editId').value = '';
    loadAdminProducts();
  } else {
    alert('មានបញ្ហា! សូមព្យាយាមម្តងទៀត');
  }
});

function editProduct(p) {
  document.getElementById('editId').value = p._id;
  document.getElementById('pName').value = p.name;
  document.getElementById('pDesc').value = p.description;
  document.getElementById('pPrice').value = p.price;
  document.getElementById('pDiscount').value = p.discount;
  document.getElementById('pRating').value = p.rating;
  document.getElementById('pTag').value = p.tag;
  document.getElementById('pCategory').value = p.category;
  document.getElementById('pSize').value = p.size.join(', ');
  document.getElementById('pColor').value = p.color;
  document.getElementById('pStock').value = p.stock;
  window.scrollTo(0, 0);
}

async function deleteProduct(id) {
  if (!confirm('តើអ្នកប្រាកដជាចង់លុបទំនិញនេះមែនទេ?')) return;
  await fetch(`${API_URL}/products/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });
  loadAdminProducts();
}

// ---- ORDERS ----
async function loadAdminOrders() {
  const res = await fetch(`${API_URL}/orders/all`, {
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });
  const orders = await res.json();
  const tbody = document.getElementById('orderTableBody');

  if (orders.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6">មិនទាន់មានការបញ្ជាទិញនៅឡើយទេ</td></tr>';
    return;
  }

  tbody.innerHTML = orders.map(o => `
    <tr>
      <td>#${o._id.slice(-6).toUpperCase()}</td>
      <td>${o.user?.name || 'N/A'}<br><small style="color:var(--gray)">${o.user?.phone || ''}</small></td>
      <td>${o.items.map(i => `${i.name} x${i.qty}`).join('<br>')}</td>
      <td><strong>$${o.total.toFixed(2)}</strong></td>
      <td>${new Date(o.createdAt).toLocaleDateString('km-KH')}</td>
      <td>
        <select onchange="updateOrderStatus('${o._id}', this.value)" style="padding:6px; border-radius:6px;">
          <option value="Pending" ${o.status === 'Pending' ? 'selected' : ''}>Pending</option>
          <option value="Confirmed" ${o.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
          <option value="Shipped" ${o.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
          <option value="Delivered" ${o.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
        </select>
      </td>
    </tr>
  `).join('');
}

async function updateOrderStatus(orderId, status) {
  const res = await fetch(`${API_URL}/orders/${orderId}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
    body: JSON.stringify({ status })
  });
  if (res.ok) {
    alert(`✅ ស្ថានភាព Order ត្រូវបានប្តូរទៅ ${status}`);
  } else {
    alert('❌ មានបញ្ហា!');
  }
}

// ---- INIT ----
if (getToken()) {
  document.getElementById('loginBox').style.display = 'none';
  document.getElementById('adminPanel').style.display = 'block';
  loadDashboard();
} else {
  document.getElementById('adminPanel').style.display = 'none';
}