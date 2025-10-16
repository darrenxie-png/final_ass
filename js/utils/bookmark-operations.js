import { initDB } from './db-init.js';

export const BookmarkOperations = {
  async getAllBookmarks() {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['bookmarks'], 'readonly');
      const store = transaction.objectStore('bookmarks');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async addBookmark(story) {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['bookmarks'], 'readwrite');
      const store = transaction.objectStore('bookmarks');
      const request = store.add({ ...story, timestamp: Date.now() });

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  },

  async removeBookmark(id) {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['bookmarks'], 'readwrite');
      const store = transaction.objectStore('bookmarks');
      const request = store.delete(id);

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  },

  async isBookmarked(id) {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['bookmarks'], 'readonly');
      const store = transaction.objectStore('bookmarks');
      const request = store.get(id);

      request.onsuccess = () => resolve(!!request.result);
      request.onerror = () => reject(request.error);
    });
  }
};