// ==========================================
// LOCAL AUDIO STORAGE (INDEXEDDB PERSISTENCE)
// ==========================================
// Stores raw audio blobs/buffers offline in browser IndexedDB.
// Guarantees 100% instant playback without CORS errors or cloud storage provisioning delays!

const DB_NAME = "NeonPianoAudioDB";
const STORE_NAME = "audio_tracks";
const DB_VERSION = 1;

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
}

/**
 * Saves audio Blob or ArrayBuffer to IndexedDB
 * 
 * @param {string} id Unique track identifier
 * @param {Blob|ArrayBuffer} data Audio binary
 */
export async function saveAudioToIndexedDB(id, data) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const item = { id, data, updatedAt: Date.now() };

    const req = store.put(item);
    req.onsuccess = () => resolve(true);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Retrieves audio binary from IndexedDB
 * 
 * @param {string} id 
 * @returns {Promise<Blob|ArrayBuffer|null>}
 */
export async function getAudioFromIndexedDB(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);

    const req = store.get(id);
    req.onsuccess = () => {
      resolve(req.result ? req.result.data : null);
    };
    req.onerror = () => reject(req.error);
  });
}

/**
 * Removes audio binary from IndexedDB
 * 
 * @param {string} id 
 */
export async function deleteAudioFromIndexedDB(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);

    const req = store.delete(id);
    req.onsuccess = () => resolve(true);
    req.onerror = () => reject(req.error);
  });
}
