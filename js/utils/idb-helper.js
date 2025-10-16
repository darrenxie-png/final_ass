import { dbConfig } from './idb-config.js';

export const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbConfig.name, dbConfig.version);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      const store = db.createObjectStore('bookmarks', { keyPath: 'id' });
      store.createIndex('createdAt', 'createdAt', { unique: false });
    };
  });
};

export const BookmarkDB = {
  async getAll() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('bookmarks', 'readonly');
      const store = transaction.objectStore('bookmarks');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async add(story) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('bookmarks', 'readwrite');
      const store = transaction.objectStore('bookmarks');
      story.createdAt = new Date().toISOString();
      const request = store.add(story);

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  },

  async remove(id) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('bookmarks', 'readwrite');
      const store = transaction.objectStore('bookmarks');
      const request = store.delete(id);

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  },

  async isBookmarked(id) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('bookmarks', 'readonly');
      const store = transaction.objectStore('bookmarks');
      const request = store.get(id);

      request.onsuccess = () => resolve(!!request.result);
      request.onerror = () => reject(request.error);
    });
  }
};