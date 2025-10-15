// js/router.js
import Home from './home.js';
import Add from './add.js';
import Login from './login.js';
import Register from './register.js';

const routes = {
  '/': Home,
  '/add': Add,
  '/login': Login,
  '/register': Register,
};

const router = async () => {
  const content = document.getElementById('mainContent');
  const url = window.location.hash.slice(1).toLowerCase() || '/';
  const page = routes[url] || Home;

  // Cegah akses ke halaman tambah jika belum login
  const token = localStorage.getItem('token');
  if (!token && (url === '/add')) {
    alert('Silakan login terlebih dahulu untuk menambah story.');
    window.location.hash = '/login';
    return;
  }

  // Jalankan render halaman dengan transisi (kalau didukung browser)
  if (document.startViewTransition) {
    document.startViewTransition(async () => {
      content.innerHTML = await page.render();
      if (page.afterRender) await page.afterRender();

      // Panggil updateNavbar setiap kali halaman berubah
      if (window.updateNavbar) window.updateNavbar();
    });
  } else {
    content.innerHTML = await page.render();
    if (page.afterRender) await page.afterRender();

    if (window.updateNavbar) window.updateNavbar();
  }
};

// Event listener untuk perubahan hash dan saat halaman dimuat
window.addEventListener('hashchange', router);
window.addEventListener('load', router);

export default router;
