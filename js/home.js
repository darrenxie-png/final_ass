import L from 'leaflet';
import 'leaflet/dist/leaflet.css'; // pastikan CSS bawaan Leaflet ikut di-load
import { subscribePushNotification } from './notification-helper.js';
import { BookmarkOperations } from './utils/bookmark-operations.js';
import { BookmarkStore } from './utils/database.js';

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

  async renderStories(stories, container) {
    container.innerHTML = '';
    
    for (const story of stories) {
      const isBookmarked = await BookmarkStore.isBookmarked(story.id);
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
    }
  },

  async afterRender() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.hash = '/login';
        return;
      }

      const storyContainer = document.getElementById('stories');
      const showAllBtn = document.getElementById('showAllBtn');
      const showBookmarkedBtn = document.getElementById('showBookmarkedBtn');

      // Load stories
      const response = await fetch('https://story-api.dicoding.dev/v1/stories', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const { listStory } = await response.json();
      this.stories = listStory;

      // Initial render
      await this.renderStories(this.stories, storyContainer);

      // Handle bookmark clicks
      storyContainer.addEventListener('click', async (e) => {
        if (!e.target.classList.contains('bookmark-btn')) return;

        const btn = e.target;
        const storyId = btn.dataset.id;
        const story = this.stories.find(s => s.id === storyId);
        const isCurrentlyBookmarked = btn.classList.contains('active');

        try {
          if (isCurrentlyBookmarked) {
            await BookmarkStore.removeBookmark(storyId);
            btn.classList.remove('active');
            btn.textContent = '☆';
          } else {
            await BookmarkStore.saveBookmark(story);
            btn.classList.add('active');
            btn.textContent = '★';




          }
        } catch (error) {
          console.error('Bookmark operation failed:', error);
        }
        
      });

      // View switches
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
      console.error('Failed to initialize home:', error);
    }
  }
};

export default Home;
