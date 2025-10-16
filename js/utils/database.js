const DATABASE_NAME = 'webgis-story-db';
const DATABASE_VERSION = 1;
const BOOKMARKS_STORE = 'bookmarks';

export const initDatabase = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

    request.onerror = () => {
      reject(new Error('Failed to open database'));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(BOOKMARKS_STORE)) {
        db.createObjectStore(BOOKMARKS_STORE, { keyPath: 'id' });
      }
    };
  });
};

export const BookmarkStore = {
  async saveBookmark(story) {
    const db = await initDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([BOOKMARKS_STORE], 'readwrite');
      const store = transaction.objectStore(BOOKMARKS_STORE);
      const request = store.put({ ...story, timestamp: Date.now() });

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(new Error('Failed to save bookmark'));
    });
  },

  async removeBookmark(id) {
    const db = await initDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([BOOKMARKS_STORE], 'readwrite');
      const store = transaction.objectStore(BOOKMARKS_STORE);
      const request = store.delete(id);

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(new Error('Failed to remove bookmark'));
    });
  },

  async getBookmarks() {
    const db = await initDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([BOOKMARKS_STORE], 'readonly');
      const store = transaction.objectStore(BOOKMARKS_STORE);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error('Failed to get bookmarks'));
    });
  },

  async isBookmarked(id) {
    const db = await initDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([BOOKMARKS_STORE], 'readonly');
      const store = transaction.objectStore(BOOKMARKS_STORE);
      const request = store.get(id);

      request.onsuccess = () => resolve(!!request.result);
      request.onerror = () => reject(new Error('Failed to check bookmark'));
    });
  }
};