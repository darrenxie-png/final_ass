import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const Add = {
  async render() {
    return `
      <section class="add-section">
        <h2 class="page-title">Tambah Story Baru</h2>
        <form id="addForm" class="add-form">
          <label for="name">Nama</label>
          <input type="text" id="name" name="name" placeholder="Nama story" required />

          <label for="description">Deskripsi</label>
          <textarea id="description" name="description" placeholder="Deskripsi cerita" required></textarea>

          <label for="photo">Foto</label>
          <input type="file" id="photo" name="photo" accept="image/*" required />

          <label>Pilih Lokasi di Peta</label>
          <div id="map" class="map-container"></div>

          <label for="lat">Latitude</label>
          <input type="text" id="lat" name="lat" placeholder="Klik peta untuk menentukan" readonly required />

          <label for="lon">Longitude</label>
          <input type="text" id="lon" name="lon" placeholder="Klik peta untuk menentukan" readonly required />

          <button type="submit" class="submit-btn">Tambah Story</button>
        </form>
      </section>
    `;
  },

  async afterRender() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.hash = '#/login';
        return;
      }

      // Clear existing map if present
      const mapContainer = L.DomUtil.get('map');
      if (mapContainer != null) {
        mapContainer._leaflet_id = null;
      }

      // Initialize map
      const map = L.map('map').setView([-2.5, 118], 5);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);

      // Add initial marker
      let marker = L.marker([-2.5, 118]).addTo(map).bindPopup('📍 -2.500000, 118.000000').openPopup();

      // Handle map clicks
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        document.getElementById('lat').value = lat.toFixed(6);
        document.getElementById('lon').value = lng.toFixed(6);

        if (marker) map.removeLayer(marker);
        marker = L.marker([lat, lng]).addTo(map).bindPopup(`📍 ${lat.toFixed(6)}, ${lng.toFixed(6)}`).openPopup();
      });

      // Invalidate map size to ensure proper rendering
      setTimeout(() => {
        map.invalidateSize();
      }, 100);

      // Handle form submission
      document.getElementById('addForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        try {
          const name = document.getElementById('name').value;
          const description = document.getElementById('description').value;
          const photo = document.getElementById('photo').files[0];
          const lat = document.getElementById('lat').value;
          const lon = document.getElementById('lon').value;

          if (!name || !description || !photo || !lat || !lon) {
            alert('Semua field harus diisi dan lokasi harus dipilih!');
            return;
          }

          const formData = new FormData();
          formData.append('name', name);
          formData.append('description', description);
          formData.append('photo', photo);
          formData.append('lat', lat);
          formData.append('lon', lon);

          const response = await fetch('https://story-api.dicoding.dev/v1/stories', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
          });

          const result = await response.json();
          
          if (result.error === false) {
            alert(result.message || 'Story berhasil ditambahkan!');
            
            // Show notification if permission granted
            if (Notification.permission === 'granted') {
              new Notification('Story Baru Ditambahkan!', {
                body: `"${name}" berhasil dipublikasikan`,
                icon: '/final_ass/assets/icons/icon-192.png'
              });
            }
            
            // Redirect to home
            window.location.hash = '#/home';
          } else {
            alert(`Error: ${result.message}`);
          }
        } catch (error) {
          console.error('Failed to add story:', error);
          alert('Gagal menambahkan story: ' + error.message);
        }
      });

    } catch (error) {
      console.error('Failed to initialize add page:', error);
    }
  },
};

export default Add;