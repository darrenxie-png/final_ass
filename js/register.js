// js/register.js
const Register = {
  render() {
    return `
      <section class="register-section">
  <h1>Daftar Akun</h1>
  <form id="registerForm">
    <label for="name">Nama</label>
    <input id="name" type="text" required />

    <label for="email">Email</label>
    <input id="email" type="email" required />

    <label for="password">Kata Sandi</label>
    <input id="password" type="password" required />

    <button type="submit">Daftar</button>
  </form>
        <p>Sudah punya akun? <a href="#/login">Login di sini</a></p>
      </section>
    `;
  },

  afterRender() {
    const form = document.getElementById('registerForm');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;

      if (password.length < 8) {
        alert('Password harus minimal 8 karakter');
        return;
      }

      try {
        const response = await fetch('https://story-api.dicoding.dev/v1/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name, email, password }),
        });

        const result = await response.json();
        if (!result.error) {
          alert('Registrasi berhasil! Silakan login.');
          window.location.hash = '/login';
        } else {
          alert(`Registrasi gagal: ${result.message}`);
        }
      } catch (err) {
        console.error(err);
        alert('Terjadi kesalahan koneksi.');
      }
    });
  },
};

export default Register;
