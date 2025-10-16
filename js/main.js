// js/main.js
import './router.js';
import { initializeNotification } from './utils/notification-helper.js';
import { urlBase64ToUint8Array } from './utils/web-push.js';

const VAPID_PUBLIC_KEY = 'BKt_cM0Uoq5ijZexhi46VAL7lRT0AjIXdSXuP_guU1NgfzCtSYUYeECFD-_KxX40TnFLbFRXWPwkF0c0epLFF60';

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
const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('./service-worker.js');
      console.log('Service Worker registered successfully');
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }
  return null;
};

const initializeApp = async () => {
  const swRegistration = await registerServiceWorker();
  if (swRegistration) {
    await navigator.serviceWorker.ready;
    
    if (Notification.permission !== 'granted') {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.log('Notification permission denied');
        return;
      }
    }

    try {
      const convertedVapidKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
      const subscription = await swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      });
      console.log('Push notification subscription successful:', subscription);
    } catch (error) {
      console.error('Push notification subscription failed:', error);
    }
  }
};

window.addEventListener('load', initializeApp);
