import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { BookmarkStore } from './utils/database.js';

// Fix Leaflet default icons from CDN
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const Home = {
  map: null,
  stories: [],

  async render() {
    return `
      <section class="home-section">
        <h2 class="page-title">📍 Daftar Story</h2>
        <div id="map" style="height: 400px; width: 100%; margin: 20px 0; border: 1px solid #ddd; border-radius: 8px;"></div>
        <div class="story-controls">
          <button id="showAllBtn" class="active">Semua Story</button>
          <button id="showBookmarkedBtn">Story Tersimpan</button>
        </div>
        <div id="stories" class="story-list"></div>
      </section>
    `;
  },

  initializeMap() {
    // Clean up old map
    if (this.map) {
      this.map.remove();
      this.map = null;
    }

    const mapElement = document.getElementById('map');
    if (!mapElement) {
      console.error('Map element not found');
      return false;
    }

    try {
      this.map = L.map('map').setView([-2.5489, 118.0149], 5);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(this.map);

      setTimeout(() => {
        if (this.map) this.map.invalidateSize();
      }, 100);

      return true;
    } catch (error) {
      console.error('Map init error:', error);
      return false;
    }
  },

  async renderStories(stories, container) {
    if (!container) return;
    container.innerHTML = '';
    
    // Clear markers
    if (this.map) {
      this.map.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          this.map.removeLayer(layer);
        }
      });
    }
    
    for (const story of stories) {
      try {
        const isBookmarked = await BookmarkStore.isBookmarked(story.id);
        
        // Add marker if has coordinates
        if (story.lat && story.lon && this.map) {
          const lat = parseFloat(story.lat);
          const lon = parseFloat(story.lon);
          
          if (!isNaN(lat) && !isNaN(lon)) {
            L.marker([lat, lon])
              .bindPopup(`<strong>${story.name}</strong><br><small>${story.description}</small>`)
              .addTo(this.map);
          }
        }
        
        container.innerHTML += `
          <article class="story-card" data-id="${story.id}">
            <img src="${story.photoUrl}" alt="${story.name}" class="story-img">
            <div class="story-info">
              <h3>${story.name}</h3>
              <p>${story.description}</p>
              ${story.lat && story.lon ? `<p class="location">📍 ${story.lat}, ${story.lon}</p>` : ''}
              <button class="bookmark-btn ${isBookmarked ? 'active' : ''}" data-id="${story.id}">
                ${isBookmarked ? '★' : '☆'}
              </button>
            </div>
          </article>
        `;
      } catch (error) {
        console.error('Error rendering story:', error);
      }
    }
  },

  async afterRender() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.hash = '#/login';
        return;
      }

      this.initializeMap();

      const storyContainer = document.getElementById('stories');
      const showAllBtn = document.getElementById('showAllBtn');
      const showBookmarkedBtn = document.getElementById('showBookmarkedBtn');

      // Fetch stories
      const response = await fetch('https://story-api.dicoding.dev/v1/stories', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = await response.json();
      this.stories = data.listStory || [];

      await this.renderStories(this.stories, storyContainer);

      // Bookmark handler
      storyContainer.addEventListener('click', async (e) => {
        if (!e.target.classList.contains('bookmark-btn')) return;

        const btn = e.target;
        const storyId = btn.dataset.id;
        const story = this.stories.find(s => s.id === storyId);
        if (!story) return;

        try {
          const isBookmarked = btn.classList.contains('active');
          if (isBookmarked) {
            await BookmarkStore.removeBookmark(storyId);
            btn.classList.remove('active');
            btn.textContent = '☆';
          } else {
            await BookmarkStore.saveBookmark(story);
            btn.classList.add('active');
            btn.textContent = '★';
          }
        } catch (error) {
          console.error('Bookmark error:', error);
        }
      });

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
      console.error('Home error:', error);
    }
  }
};

export default Home;