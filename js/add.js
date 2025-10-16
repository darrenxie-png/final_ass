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
    const token = localStorage.getItem('token');
    const mapContainer = L.DomUtil.get('map');
    if (mapContainer != null) {
      mapContainer._leaflet_id = null;
    }

    const map = L.map('map').setView([-2.5, 118], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    // Add a marker at the initial center
    let marker = L.marker([-2.5, 118]).addTo(map).bindPopup('📍 -2.500000, 118.000000').openPopup();

    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      document.getElementById('lat').value = lat.toFixed(6);
      document.getElementById('lon').value = lng.toFixed(6);

      if (marker) map.removeLayer(marker);
      marker = L.marker([lat, lng]).addTo(map).bindPopup(`📍 ${lat.toFixed(6)}, ${lng.toFixed(6)}`).openPopup();
    });

    document.getElementById('addForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      try {
        const formData = new FormData();
        formData.append('description', document.getElementById('description').value);
        formData.append('photo', document.getElementById('photo').files[0]);
        formData.append('lat', document.getElementById('lat').value);
        formData.append('lon', document.getElementById('lon').value);

        const response = await fetch('https://story-api.dicoding.dev/v1/stories', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        const result = await response.json();
        alert(result.message || 'Story berhasil ditambahkan!');
        
        if (result.error === false) {
          // Show notification if permission granted
          if (Notification.permission === 'granted') {
            const notification = new Notification('Story Baru Ditambahkan!', {
              body: 'Story berhasil dipublikasikan',
              icon: './icons/icon-192.png'
            });
          }
          
          window.location.hash = '/';
        }
      } catch (error) {
        alert('Gagal menambahkan story: ' + error.message);
      }
    });
  },
};

export default Add;
