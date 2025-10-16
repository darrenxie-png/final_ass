export const dbConfig = {
  name: 'webgis-story-db',
  version: 1,
  objectStores: [{
    name: 'bookmarks',
    keyPath: 'id',
    indexes: []
  }]
};