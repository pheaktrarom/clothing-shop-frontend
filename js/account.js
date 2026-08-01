const API_URL = 'http://localhost:5000/api';

function switchTab(tab) {
  document.getElementById('tabLogin').classList.toggle('active', tab === 'login');
  document.getElementById('tabRegister').classList.toggle('active', tab === 'register');
  document.getElementById('loginForm').style.display = tab === 'login' ? 'block' : 'none';
  document.getElementById('registerForm').style.display = tab === 'register' ? 'block' : 'none';
}

async function registerUser() {
  const name = document.getElementById('regName').value;
  const email = document.getElementById('regEmail').value;
  const password = document.getElementById('regPassword').value;
  const phone = document.getElementById('regPhone').value;
  const address = document.getElementById('regAddress').value;

  const res = await fetch(`${API_URL}/customer/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, phone, address })
  });
  const data = await res.json();

  if (res.ok) {
    localStorage.setItem('customerToken', data.token);
    localStorage.setItem('customerInfo', JSON.stringify(data.user));
    location.reload();
  } else {
    document.getElementById('regError').textContent = data.message;
  }
}

async function loginUser() {
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  const res = await fetch(`${API_URL}/customer/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();

  if (res.ok) {
    localStorage.setItem('customerToken', data.token);
    localStorage.setItem('customerInfo', JSON.stringify(data.user));
    location.reload();
  } else {
    document.getElementById('loginError').textContent = data.message;
  }
}

function logoutUser() {
  localStorage.removeItem('customerToken');
  localStorage.removeItem('customerInfo');
  location.reload();
}

async function loadOrderHistory() {
  const token = localStorage.getItem('customerToken');
  const res = await fetch(`${API_URL}/orders/my-orders`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const orders = await res.json();
  const container = document.getElementById('orderHistory');

  if (!res.ok || orders.length === 0) {
    container.innerHTML = '<p>អ្នកមិនទាន់មានការបញ្ជាទិញនៅឡើយទេ</p>';
    return;
  }

  container.innerHTML = orders.map(o => `
    <div class="cart-item" style="align-items:flex-start; flex-direction:column;">
      <div style="display:flex; justify-content:space-between; width:100%;">
        <strong>ការបញ្ជាទិញ #${o._id.slice(-6).toUpperCase()}</strong>
        <span class="badge-tag badge-new">${o.status}</span>
      </div>
      <p style="color:var(--gray); font-size:13px;">${new Date(o.createdAt).toLocaleDateString('km-KH')}</p>
      <p>${o.items.map(i => `${i.name} x${i.qty}`).join(', ')}</p>
      <strong style="color:var(--primary);">សរុប: $${o.total.toFixed(2)}</strong>
    </div>
  `).join('');
}

// Init
const token = localStorage.getItem('customerToken');
const info = JSON.parse(localStorage.getItem('customerInfo') || 'null');

if (token && info) {
  document.getElementById('authBox').style.display = 'none';
  document.getElementById('profileBox').style.display = 'block';
  document.getElementById('pfName').textContent = info.name;
  document.getElementById('pfEmail').textContent = info.email;
  document.getElementById('pfPhone').textContent = info.phone || '-';
  document.getElementById('pfAddress').textContent = info.address || '-';
  loadOrderHistory();
}