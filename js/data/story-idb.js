import { openDB } from '../utils/idb.js';

const DB_NAME = 'webgis-story-db';
const DB_VERSION = 1;
const STORY_STORE = 'bookmarked-stories';

const dbPromise = openDB(DB_NAME, DB_VERSION, (database) => {
  if (!database.objectStoreNames.contains(STORY_STORE)) {
    database.createObjectStore(STORY_STORE, { keyPath: 'id' });
  }
});

const StoryIdb = {
  async getBookmarkedStories() {
    const db = await dbPromise;
    const tx = db.transaction(STORY_STORE, 'readonly');
    const store = tx.objectStore(STORY_STORE);
    return store.getAll();
  },

  async getBookmarkedStory(id) {
    const db = await dbPromise;
    const tx = db.transaction(STORY_STORE, 'readonly');
    const store = tx.objectStore(STORY_STORE);
    return store.get(id);
  },

  async bookmarkStory(story) {
    const db = await dbPromise;
    const tx = db.transaction(STORY_STORE, 'readwrite');
    const store = tx.objectStore(STORY_STORE);
    return store.add(story);
  },

  async removeBookmark(id) {
    const db = await dbPromise;
    const tx = db.transaction(STORY_STORE, 'readwrite');
    const store = tx.objectStore(STORY_STORE);
    return store.delete(id);
  },

  async isStoryBookmarked(id) {
    const story = await this.getBookmarkedStory(id);
    return !!story;
  }
};

export default StoryIdb;