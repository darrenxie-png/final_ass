export const openDB = (dbName, version, upgradeCallback) => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, version);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      upgradeCallback(event.target.result);
    };
  });
};
