// js/indexedDB.js

const DB_NAME = 'webgis_story_db';
const DB_VERSION = 1;
const STORE_NAME = 'bookmarked_stories';

const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject('❌ Gagal membuka IndexedDB');
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };
  });
};

// Bookmark story
export const bookmarkStory = async (story) => {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    
    story.bookmarkedAt = new Date().toISOString();
    await store.add(story);
    
    return { success: true, message: '✅ Story berhasil disimpan' };
  } catch (error) {
    return { success: false, message: '❌ Gagal menyimpan story' };
  }
};

// Remove bookmark
export const removeBookmark = async (storyId) => {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    
    await store.delete(storyId);
    return { success: true, message: '✅ Bookmark dihapus' };
  } catch (error) {
    return { success: false, message: '❌ Gagal menghapus bookmark' };
  }
};

// Check if story is bookmarked
export const isStoryBookmarked = async (storyId) => {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    
    const story = await store.get(storyId);
    return !!story;
  } catch (error) {
    return false;
  }
};

// Get all bookmarked stories
export const getBookmarkedStories = async () => {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    
    return await store.getAll();
  } catch (error) {
    return [];
  }
};
