// js/main.js
import './router.js';

function updateNavbar() {
  const navLinks = document.getElementById('navLinks');
  const token = localStorage.getItem('token');

  if (!navLinks) return;

  // 🔹 Tampilkan navigasi sesuai status login
  if (token) {
    navLinks.innerHTML = `
      <a href="#/" class="nav-btn" aria-label="Beranda">🏠 Home</a>
      <a href="#/add" class="nav-btn" aria-label="Tambah Story">➕ Tambah Story</a>
      <button id="logoutBtn" class="nav-btn logout-btn" aria-label="Logout">🚪 Logout</button>
    `;
  } else {
    navLinks.innerHTML = `
      <a href="#/" class="nav-btn" aria-label="Beranda">🏠 Home</a>
      <a href="#/login" class="nav-btn" aria-label="Masuk">🔑 Login</a>
      <a href="#/register" class="nav-btn" aria-label="Daftar Akun">📝 Register</a>
    `;
  }

  // 🔹 Tambahkan event Logout jika tombol tersedia
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('token');
      alert('Anda telah berhasil logout.');
      updateNavbar();
      window.location.hash = '/login';
    });
  }
}

// Jalankan saat halaman pertama kali dimuat
window.addEventListener('load', updateNavbar);
// Jalankan juga setiap kali rute berubah
window.addEventListener('hashchange', updateNavbar);

// 🔹 Daftarkan Service Worker (PWA)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('../service-worker.js');
      console.log('ServiceWorker registration successful');
      
      // Request notification permission after SW registration
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        console.log('Notification permission:', permission);
      }
    } catch (error) {
      console.error('ServiceWorker registration failed:', error);
    }
  });
}
