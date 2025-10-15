import L from 'leaflet';
import 'leaflet/dist/leaflet.css'; // pastikan CSS bawaan Leaflet ikut di-load
import { subscribePushNotification } from './notification-helper.js';
import StoryIdb from './data/story-idb.js';

const Home = {
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
        <button id="notifBtn" class="notification-btn">
          Aktifkan Notifikasi
        </button>
      </section>
    `;
  },

  async afterRender() {
    const token = localStorage.getItem('token');
    
    // Redirect if no token
    if (!token) {
      window.location.hash = '/login';
      return;
    }

    const storyList = document.getElementById('stories');

    // Reset map container
    const mapContainer = L.DomUtil.get('map');
    if (mapContainer != null) {
      mapContainer._leaflet_id = null;
    }

    // Initialize map
    const map = L.map('map').setView([-2.5, 118], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    try {
      const response = await fetch('https://story-api.dicoding.dev/v1/stories?size=30', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch stories');
      }

      const result = await response.json();

      const renderStory = async (story) => {
        const isBookmarked = await StoryIdb.isStoryBookmarked(story.id);
        return `
          <article class="story-card">
            <img src="${story.photoUrl}" alt="Story from ${story.name}" class="story-img" />
            <div class="story-info">
              <h3>${story.name}</h3>
              <p>${story.description}</p>
              ${story.lat && story.lon ? `<p class="location">📍 ${story.lat}, ${story.lon}</p>` : ''}
              <button class="bookmark-btn ${isBookmarked ? 'bookmarked' : ''}" 
                      data-id="${story.id}">
                ${isBookmarked ? '★' : '☆'}
              </button>
            </div>
          </article>
        `;
      };

      const handleBookmarkClick = async (event) => {
        if (!event.target.classList.contains('bookmark-btn')) return;
        
        const storyId = event.target.dataset.id;
        const storyCard = event.target.closest('.story-card');
        const isBookmarked = event.target.classList.contains('bookmarked');
        
        try {
          if (isBookmarked) {
            await StoryIdb.removeBookmark(storyId);
            event.target.textContent = '☆';
          } else {
            const story = result.listStory.find(s => s.id === storyId);
            await StoryIdb.bookmarkStory(story);
            event.target.textContent = '★';
          }
          event.target.classList.toggle('bookmarked');
        } catch (error) {
          console.error('Bookmark error:', error);
        }
      };

      document.getElementById('stories').addEventListener('click', handleBookmarkClick);
      
      // Show bookmarked stories
      document.getElementById('showBookmarkedBtn').addEventListener('click', async () => {
        const bookmarkedStories = await StoryIdb.getBookmarkedStories();
        storyList.innerHTML = '';
        for (const story of bookmarkedStories) {
          storyList.innerHTML += await renderStory(story);
        }
      });

      // Show all stories
      document.getElementById('showAllBtn').addEventListener('click', async () => {
        storyList.innerHTML = '';
        if (result.listStory && result.listStory.length > 0) {
          for (const story of result.listStory) {
            storyList.innerHTML += await renderStory(story);
          }
        } else {
          storyList.innerHTML = '<p class="no-stories">Tidak ada story ditemukan.</p>';
        }
      });

      if (result.listStory && result.listStory.length > 0) {
        storyList.innerHTML = '';
        
        result.listStory.forEach((story) => {
          // Add story card
          storyList.innerHTML += `
            <article class="story-card">
              <img src="${story.photoUrl}" alt="Story from ${story.name}" class="story-img" />
              <div class="story-info">
                <h3>${story.name}</h3>
                <p>${story.description}</p>
                ${story.lat && story.lon ? `<p class="location">📍 ${story.lat}, ${story.lon}</p>` : ''}
              </div>
            </article>
          `;

          // Add marker if location exists
          if (story.lat && story.lon) {
            const lat = parseFloat(story.lat);
            const lon = parseFloat(story.lon);
            
            if (!isNaN(lat) && !isNaN(lon)) {
              const marker = L.marker([lat, lon])
                .addTo(map)
                .bindPopup(`
                  <div class="popup-content">
                    <h4>${story.name}</h4>
                    <img src="${story.photoUrl}" alt="Story thumbnail" style="width:100%;max-width:200px;margin:5px 0">
                    <p>${story.description}</p>
                  </div>
                `);
            }
          }
        });
      } else {
        storyList.innerHTML = '<p class="no-stories">Tidak ada story ditemukan.</p>';
      }
    } catch (error) {
      console.error('Error:', error);
      storyList.innerHTML = `<p class="error-message">Error: ${error.message}</p>`;
    }

    // Add notification button handler
    document.getElementById('notifBtn').addEventListener('click', async () => {
      await subscribePushNotification();
    });
  },
};

export default Home;
