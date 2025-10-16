import { openDB } from 'idb';

const DB_NAME = 'webgis-story-db';
const DB_VERSION = 1;
const STORE_NAME = 'bookmarks';

const initDB = async () => {
  return openDB('webgis-story-db', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('bookmarks')) {
        db.createObjectStore('bookmarks', { keyPath: 'id' });
      }
    },
  });
};

export { initDB };