import L from 'leaflet';
import 'leaflet/dist/leaflet.css'; // pastikan CSS bawaan Leaflet ikut di-load
import { subscribePushNotification } from './notification-helper.js';
import StoryBookmark from './utils/idb.js';

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
      </section>
    `;
  },

  async renderStoryCard(story, isBookmarked = false) {
    return `
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
  },

  async afterRender() {
    const token = localStorage.getItem('token');
    
    // Redirect if no token
    if (!token) {
      window.location.hash = '/login';
      return;
    }

    const storyList = document.getElementById('stories');
    const showAllBtn = document.getElementById('showAllBtn');
    const showBookmarkedBtn = document.getElementById('showBookmarkedBtn');

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

      const renderStories = async (stories) => {
        storyList.innerHTML = '';
        for (const story of stories) {
          const isBookmarked = await StoryBookmark.isBookmarked(story.id);
          storyList.innerHTML += await this.renderStoryCard(story, isBookmarked);
        }
      };

      // Handle bookmark clicks
      storyList.addEventListener('click', async (e) => {
        if (!e.target.classList.contains('bookmark-btn')) return;
        
        const storyId = e.target.dataset.id;
        const story = result.listStory.find(s => s.id === storyId);
        const isCurrentlyBookmarked = e.target.classList.contains('active');

        try {
          if (isCurrentlyBookmarked) {
            await StoryBookmark.deleteBookmark(storyId);
            e.target.textContent = '☆';
          } else {
            await StoryBookmark.saveBookmark(story);
            e.target.textContent = '★';
          }
          e.target.classList.toggle('active');
        } catch (error) {
          console.error('Error toggling bookmark:', error);
        }
      });

      // Show all stories
      showAllBtn.addEventListener('click', async () => {
        showAllBtn.classList.add('active');
        showBookmarkedBtn.classList.remove('active');
        await renderStories(result.listStory);
      });

      // Show bookmarked stories
      showBookmarkedBtn.addEventListener('click', async () => {
        showAllBtn.classList.remove('active');
        showBookmarkedBtn.classList.add('active');
        const bookmarkedStories = await StoryBookmark.getAllBookmarks();
        await renderStories(bookmarkedStories);
      });

      // Initial render
      await renderStories(result.listStory);

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
