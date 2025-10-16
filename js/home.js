// =============================
// 📁 home.js
// =============================
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { BookmarkStore } from './utils/database.js';

const Home = {
  map: null,
  stories: [],

  async render() {
    return `
      <section class="home-section">
        <h2 class="page-title">📍 Daftar Story</h2>
        <div id="map" class="map-container"></div>

        <div class="story-controls">
          <button id="showAllBtn" class="active">Semua Story</button>
          <button id="showBookmarkedBtn">Story Tersimpan</button>
        </div>

        <div id="stories" class="story-list"></div>
      </section>
    `;
  },

  initializeMap() {
    console.log('🗺️ Inisialisasi peta...');

    // Hapus peta lama jika ada
    if (this.map) {
      this.map.remove();
    }

    // Pastikan elemen peta ada
    const mapElement = document.getElementById('map');
    if (!mapElement) {
      console.error('❌ Elemen peta tidak ditemukan!');
      return;
    }

    // Buat peta baru
    this.map = L.map('map').setView([-2.5489, 118.0149], 5);

    // Tambahkan tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(this.map);

    // Perbaiki tampilan ukuran peta
    setTimeout(() => this.map.invalidateSize(), 200);
    setTimeout(() => this.map.invalidateSize(), 500);

    console.log('✅ Peta berhasil dibuat');
  },

  async renderStories(stories, container) {
    container.innerHTML = '';

    // Bersihkan marker lama
    if (this.map) {
      this.map.eachLayer(layer => {
        if (layer instanceof L.Marker) {
          this.map.removeLayer(layer);
        }
      });
    }

    for (const story of stories) {
      const isBookmarked = await BookmarkStore.isBookmarked(story.id);

      // Tambahkan marker jika ada koordinat
      if (story.lat && story.lon && this.map) {
        try {
          const lat = parseFloat(story.lat);
          const lon = parseFloat(story.lon);

          if (!isNaN(lat) && !isNaN(lon)) {
            L.marker([lat, lon])
              .addTo(this.map)
              .bindPopup(`
                <div class="popup-content">
                  <h3>${story.name}</h3>
                  <p>${story.description}</p>
                  <img src="${story.photoUrl}" 
                       alt="${story.name}" 
                       style="max-width:200px; border-radius:4px;">
                </div>
              `);
          }
        } catch (error) {
          console.error('⚠️ Gagal menambahkan marker:', error);
        }
      }

      // Tambahkan ke daftar story
      container.innerHTML += `
        <article class="story-card" data-id="${story.id}">
          <img src="${story.photoUrl}" alt="${story.name}" class="story-img">
          <div class="story-info">
            <h3>${story.name}</h3>
            <p>${story.description}</p>
            ${
              story.lat && story.lon
                ? `<p class="location">📍 ${story.lat}, ${story.lon}</p>`
                : '<p class="location">📍 Tidak ada lokasi</p>'
            }
            <button class="bookmark-btn ${isBookmarked ? 'active' : ''}" 
                    data-id="${story.id}">
              ${isBookmarked ? '★' : '☆'}
            </button>
          </div>
        </article>
      `;
    }

    console.log(`✅ ${stories.length} story berhasil ditampilkan`);
  },

  async afterRender() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.hash = '#/login';
        return;
      }

      const storyContainer = document.getElementById('stories');
      const showAllBtn = document.getElementById('showAllBtn');
      const showBookmarkedBtn = document.getElementById('showBookmarkedBtn');

      // Inisialisasi peta terlebih dahulu
      this.initializeMap();

      // Ambil data dari API
      const response = await fetch('https://story-api.dicoding.dev/v1/stories', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      console.log('🧭 Data story diterima:', data);

      if (!data.listStory) {
        console.warn('⚠️ Tidak ada data story ditemukan');
        return;
      }

      this.stories = data.listStory;
      console.log(`📦 Total story: ${this.stories.length}`);

      // Render story pertama kali
      await this.renderStories(this.stories, storyContainer);

      // Klik bookmark
      storyContainer.addEventListener('click', async (e) => {
        if (!e.target.classList.contains('bookmark-btn')) return;

        const btn = e.target;
        const storyId = btn.dataset.id;
        const story = this.stories.find(s => s.id === storyId);
        const isActive = btn.classList.contains('active');

        try {
          if (isActive) {
            await BookmarkStore.removeBookmark(storyId);
            btn.classList.remove('active');
            btn.textContent = '☆';
          } else {
            await BookmarkStore.saveBookmark(story);
            btn.classList.add('active');
            btn.textContent = '★';
          }
        } catch (error) {
          console.error('❌ Gagal update bookmark:', error);
        }
      });

      // Tombol filter
      showAllBtn.addEventListener('click', async () => {
        showAllBtn.classList.add('active');
        showBookmarkedBtn.classList.remove('active');
        await this.renderStories(this.stories, storyContainer);
      });

      showBookmarkedBtn.addEventListener('click', async () => {
        showAllBtn.classList.remove('active');
        showBookmarkedBtn.classList.add('active');
        const bookmarks = await BookmarkStore.getBookmarks();
        await this.renderStories(bookmarks, storyContainer);
      });

    } catch (error) {
      console.error('❌ Gagal inisialisasi halaman home:', error);
    }
  },
};

export default Home;
