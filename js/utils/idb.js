const dbPromise = idb.open('story-db', 1, (db) => {
  if (!db.objectStoreNames.contains('bookmarks')) {
    db.createObjectStore('bookmarks', { keyPath: 'id' });
  }
});

const StoryBookmark = {
  async getAllBookmarks() {
    const db = await dbPromise;
    const tx = db.transaction('bookmarks', 'readonly');
    const store = tx.objectStore('bookmarks');
    return store.getAll();
  },

  async getBookmark(id) {
    const db = await dbPromise;
    const tx = db.transaction('bookmarks', 'readonly');
    const store = tx.objectStore('bookmarks');
    return store.get(id);
  },

  async saveBookmark(story) {
    const db = await dbPromise;
    const tx = db.transaction('bookmarks', 'readwrite');
    const store = tx.objectStore('bookmarks');
    await store.put(story);
  },

  async deleteBookmark(id) {
    const db = await dbPromise;
    const tx = db.transaction('bookmarks', 'readwrite');
    const store = tx.objectStore('bookmarks');
    await store.delete(id);
  },

  async isBookmarked(id) {
    const bookmark = await this.getBookmark(id);
    return !!bookmark;
  }
};

export default StoryBookmark;
