// js/main.js
import './router.js';
import { initializeNotification } from './notification-helper.js';

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
      console.log('Service Worker registered');
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
};

const requestNotificationPermission = async () => {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
};

const subscribePushNotification = async (swRegistration) => {
  try {
    const options = {
      userVisibleOnly: true,
      applicationServerKey: 'YOUR_VAPID_PUBLIC_KEY' // Replace with your VAPID public key
    };
    
    const subscription = await swRegistration.pushManager.subscribe(options);
    console.log('Push notification subscription:', subscription);
    
    // Here you would typically send the subscription to your server
    return subscription;
  } catch (error) {
    console.error('Failed to subscribe to push:', error);
    return null;
  }
};

// Initialize service worker and push notifications
window.addEventListener('load', async () => {
  const swRegistration = await registerServiceWorker();
  if (swRegistration) {
    const hasPermission = await requestNotificationPermission();
    if (hasPermission) {
      await subscribePushNotification(swRegistration);
    }
  }
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/'
      });
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    } catch (error) {
      console.error('ServiceWorker registration failed: ', error);
    }
  });
}
