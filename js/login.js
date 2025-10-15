// js/login.js
const Login = {
  render() {
    return `
      <section class="login-section">
  <h1>Login</h1>
  <form id="loginForm">
    <label for="email">Email</label>
    <input id="email" type="email" required />

    <label for="password">Kata Sandi</label>
    <input id="password" type="password" required />

    <button type="submit">Masuk</button>
  </form>
        <p>Belum punya akun? <a href="#/register">Daftar di sini</a></p>
      </section>
    `;
  },

   async afterRender() {
    const form = document.getElementById('loginForm');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      try {
        const response = await fetch('https://story-api.dicoding.dev/v1/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        const result = await response.json();

        if (!response.ok) {
          alert(result.message || 'Login gagal, periksa kembali data Anda.');
          return;
        }

        // Simpan token dan update navbar
        localStorage.setItem('token', result.loginResult.token);
        alert('Login berhasil!');

        // 🔥 Panggil updateNavbar() setelah login
        if (typeof updateNavbar === 'function') updateNavbar();

        // Arahkan ke Home
        window.location.hash = '/';
      } catch (error) {
        alert('Terjadi kesalahan: ' + error.message);
      }
    });
  },
};

export default Login;
