// ==========================================
// ADMIN SERVICE: TRACK UPLOADS & MANAGEMENT
// ==========================================
import {
  db,
  storage,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject
} from "../config/firebase.js";
import { getCurrentUser } from "./auth.js";
import { saveAudioToIndexedDB, deleteAudioFromIndexedDB } from "./localAudioStorage.js";
import { uploadAudioToSupabase, deleteAudioFromSupabase } from "../config/supabase.js";
import { i18n } from "../i18n/index.js";

/**
 * Transliterates Cyrillic text to safe Latin characters for filenames.
 */
export function transliterate(str) {
  if (!str) return "";
  const ru = {
    "а":"a","б":"b","в":"v","г":"g","ґ":"g","д":"d","е":"e","є":"ye","ё":"yo","ж":"zh",
    "з":"z","и":"i","і":"i","ї":"yi","й":"y","к":"k","л":"l","м":"m","н":"n","о":"o",
    "п":"p","р":"r","с":"s","т":"t","у":"u","ф":"f","х":"kh","ц":"ts","ч":"ch","ш":"sh",
    "щ":"shch","ы":"y","э":"e","ю":"yu","я":"ya","ъ":"","ь":""
  };

  return str.split("").map(char => {
    const lower = char.toLowerCase();
    const isUpper = char !== lower;
    const trans = ru[lower] !== undefined ? ru[lower] : char;
    return isUpper ? trans.toUpperCase() : trans;
  }).join("");
}

/**
 * Normalizes text for comparison:
 * - Cyrillic to Latin transliteration
 * - Lowercase
 * - Strips all non-alphanumeric characters
 * 
 * @param {string} str 
 * @returns {string}
 */
export function normalizeForComparison(str) {
  if (!str || typeof str !== "string") return "";
  return transliterate(str)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

/**
 * Extracts base filename from a storagePath or audioUrl.
 * E.g., 'tracks/1789230861731_Bleach_OST_-_Treachery__.mp3' -> 'Bleach_OST_-_Treachery__.mp3'
 * E.g., 'https://files.catbox.moe/qcc0pu.mp3' -> 'qcc0pu.mp3'
 * 
 * @param {string} pathOrUrl 
 * @returns {string}
 */
export function extractBaseFilename(pathOrUrl) {
  if (!pathOrUrl || typeof pathOrUrl !== "string") return "";
  const clean = pathOrUrl.split("?")[0].split("#")[0];
  const lastPart = clean.split("/").pop() || "";
  return lastPart.replace(/^\d{10,}_+/, "");
}

/**
 * Calculates SHA-256 hash of a file or Blob for binary duplicate detection.
 * 
 * @param {File|Blob} file 
 * @returns {Promise<string>}
 */
export async function calculateFileHash(file) {
  if (!file) return "";
  try {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  } catch (err) {
    console.warn("calculateFileHash warning:", err);
    return "";
  }
}

/**
 * Checks whether an incoming track or audio file is a duplicate of any existing track.
 * 
 * @param {Array<object>} existingTracks 
 * @param {object} params
 * @param {File} [params.file]
 * @param {string} [params.fileHash]
 * @param {number} [params.fileSize]
 * @param {string} [params.url]
 * @param {string} [params.title]
 * @param {string} [params.artist]
 * @param {number} [params.duration]
 * @param {string} [params.excludeTrackId]
 * @returns {{ duplicate: boolean, track: object|null, reason: string }}
 */
export function findDuplicateTrack(existingTracks, {
  file = null,
  fileHash = "",
  fileSize = 0,
  url = "",
  title = "",
  artist = "",
  duration = 0,
  excludeTrackId = null
} = {}) {
  if (!Array.isArray(existingTracks) || !existingTracks.length) {
    return { duplicate: false, track: null, reason: "" };
  }

  const normTitle = normalizeForComparison(title);
  const normArtist = normalizeForComparison(artist);
  const normFull = normalizeForComparison(`${artist} ${title}`);
  const normFullRev = normalizeForComparison(`${title} ${artist}`);
  const cleanUrl = url ? url.trim().toLowerCase().replace(/\/$/, "") : "";
  const inputDuration = Number(duration) || 0;
  const inputSize = fileSize || (file ? file.size : 0) || 0;

  // Extract filename without extension
  const rawFileName = file ? file.name : (url ? extractBaseFilename(url) : "");
  const normFileName = rawFileName ? normalizeForComparison(rawFileName.replace(/\.[^/.]+$/, "")) : "";

  for (const track of existingTracks) {
    if (!track) continue;
    const trackId = track.id || track._id;
    if (excludeTrackId && trackId === excludeTrackId) continue;

    const trackTitle = track.title || "";
    const trackArtist = track.artist || "";
    const trackUrl = track.audioUrl || "";
    const trackStorage = track.storagePath || "";
    const trackDuration = Number(track.rawDuration !== undefined ? track.rawDuration : track.duration) || 0;
    const trackHash = track.fileHash || "";
    const trackSize = Number(track.fileSize) || 0;

    // 1. SHA-256 Hash exact match (100% identical file binary)
    if (fileHash && trackHash && fileHash === trackHash) {
      return { duplicate: true, track, reason: "hash" };
    }

    // 2. Audio URL exact match
    if (cleanUrl && trackUrl) {
      const existingCleanUrl = trackUrl.trim().toLowerCase().replace(/\/$/, "");
      if (cleanUrl === existingCleanUrl) {
        return { duplicate: true, track, reason: "url" };
      }
    }

    // 3. Audio File Name match (matches against storagePath or audioUrl)
    if (normFileName) {
      const existingBase = extractBaseFilename(trackStorage || trackUrl);
      const normExistingBase = existingBase ? normalizeForComparison(existingBase.replace(/\.[^/.]+$/, "")) : "";
      if (normExistingBase && (normExistingBase === normFileName || normExistingBase.endsWith(normFileName) || normFileName.endsWith(normExistingBase))) {
        return { duplicate: true, track, reason: "filename" };
      }
    }

    // 4. File Size + close duration match (<0.5s)
    const durDiff = inputDuration > 0 && trackDuration > 0 ? Math.abs(inputDuration - trackDuration) : 999;
    if (inputSize > 0 && trackSize > 0 && inputSize === trackSize && durDiff <= 0.5) {
      return { duplicate: true, track, reason: "filesize" };
    }

    // 5. Normalized Title & Artist match
    const tTitle = normalizeForComparison(trackTitle);
    const tArtist = normalizeForComparison(trackArtist);
    const tFull = normalizeForComparison(`${trackArtist} ${trackTitle}`);

    if (normTitle && tTitle && normTitle === tTitle) {
      // If titles match, and artists either match or either is generic/empty
      if (
        !normArtist || !tArtist ||
        normArtist === tArtist ||
        normArtist === "local" || tArtist === "local" ||
        normArtist === "unknown" || tArtist === "unknown"
      ) {
        return { duplicate: true, track, reason: "title" };
      }
    }

    // Full name match (artist + title or title + artist)
    if (normFull && tFull && (normFull === tFull || normFullRev === tFull)) {
      return { duplicate: true, track, reason: "name" };
    }

    // 6. Close duration (<0.4s) + significant title similarity
    if (durDiff <= 0.4 && normTitle && tTitle) {
      if (normTitle.length >= 4 && tTitle.length >= 4) {
        if (normTitle.includes(tTitle) || tTitle.includes(normTitle)) {
          return { duplicate: true, track, reason: "duration_title" };
        }
      }
    }

    // 7. Close duration (<0.4s) + filename contains existing title or vice versa
    if (durDiff <= 0.4 && normFileName && tTitle) {
      if (tTitle.length >= 4 && (normFileName.includes(tTitle) || tTitle.includes(normFileName))) {
        return { duplicate: true, track, reason: "duration_file" };
      }
    }
  }

  return { duplicate: false, track: null, reason: "" };
}

/**
 * Ensures the currently active user is an admin.
 */
export function requireAdmin() {
  const user = getCurrentUser();
  if (!user || !user.isAdmin) {
    throw new Error(i18n.t("adminAccessDenied") || "Доступ заборонено. Потрібні права адміністратора.");
  }
  return user;
}

/**
 * Calculates audio file duration in seconds using native Web Audio API.
 * 
 * @param {File} file 
 * @returns {Promise<number>} Duration in seconds (rounded to 1 decimal)
 */
export async function calculateAudioDuration(file) {
  return new Promise((resolve) => {
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const AudioCtx = window.AudioContext || window.webkitAudioContext;
          const tempCtx = new AudioCtx();
          const decoded = await tempCtx.decodeAudioData(event.target.result);
          tempCtx.close();
          resolve(Math.round(decoded.duration * 10) / 10);
        } catch (decodeErr) {
          console.warn("Could not decode audio duration via AudioContext:", decodeErr);
          // Fallback to HTML Audio
          const audio = new Audio();
          const url = URL.createObjectURL(file);
          audio.src = url;
          audio.addEventListener("loadedmetadata", () => {
            const dur = Math.round(audio.duration * 10) / 10;
            URL.revokeObjectURL(url);
            resolve(dur);
          });
          audio.addEventListener("error", () => {
            URL.revokeObjectURL(url);
            resolve(0);
          });
        }
      };
      reader.onerror = () => resolve(0);
      reader.readAsArrayBuffer(file);
    } catch (err) {
      console.warn("Failed to calculate duration:", err);
      resolve(0);
    }
  });
}

/**
 * Uploads track file (.ogg, .mp3, .mp4, audio) to Firebase Storage
 * and saves metadata to Firestore 'tracks' collection.
 * 
 * @param {object} params
 * @param {File} params.file Audio/video file
 * @param {string} params.title Track title
 * @param {string} params.artist Track author / artist
 * @param {number} params.duration Duration in seconds
 * @param {function} params.onProgress Progress callback (percent: number)
 * @returns {Promise<object>} Created track data
 */
export async function uploadTrack({ file, title, artist, duration, onProgress = () => {} }) {
  const admin = requireAdmin();

  if (!file) throw new Error(i18n.t("adminSelectFile") || "Будь ласка, оберіть аудіофайл.");
  if (!title?.trim()) throw new Error(i18n.t("adminSpecifyTitle") || "Вкажіть назву треку.");
  if (!artist?.trim()) throw new Error(i18n.t("adminSpecifyArtist") || "Вкажіть автора / виконавця.");

  // Check for duplicates in Firestore before upload
  const fileHash = await calculateFileHash(file);
  const fileSize = file.size || 0;

  const tracksCol = collection(db, "tracks");
  const existingTracksSnap = await getDocs(tracksCol);
  const existingTracks = existingTracksSnap.docs.map(docSnap => ({
    id: docSnap.id,
    ...docSnap.data()
  }));

  const dupCheck = findDuplicateTrack(existingTracks, {
    file,
    fileHash,
    fileSize,
    title,
    artist,
    duration
  });

  if (dupCheck.duplicate && dupCheck.track) {
    const d = dupCheck.track;
    const fullTrackName = `${d.artist ? d.artist + ' - ' : ''}${d.title}`;
    throw new Error(
      (i18n.t("trackAlreadyExistsName") || "Трек «{title}» уже є у фонотеці!")
        .replace("{title}", fullTrackName)
    );
  }

  const trackLocalId = `track_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  // 1. Always save raw audio binary to local IndexedDB first (guarantees 100% offline & instant fallback)
  try {
    await saveAudioToIndexedDB(trackLocalId, file);
  } catch (idbErr) {
    console.warn("IndexedDB caching warning:", idbErr);
  }

  // 2. Upload to Supabase Cloud Storage (Fast, CORS-enabled, 100% free)
  const latinName = transliterate(file.name);
  let downloadUrl = null;
  let storagePath = null;
  let usedStorage = false;

  try {
    const res = await uploadAudioToSupabase(file, latinName, onProgress);
    downloadUrl = res.publicUrl;
    storagePath = res.storagePath;
    usedStorage = true;
  } catch (storageErr) {
    console.warn("Supabase Storage upload failed, falling back to IndexedDB local storage:", storageErr);
    downloadUrl = `indexeddb://${trackLocalId}`;
    usedStorage = false;
  }

  // 3. Save track metadata to Firestore 'tracks' collection
  const trackData = {
    title: title.trim(),
    artist: artist.trim(),
    duration: Number(duration) || 0,
    audioUrl: downloadUrl,
    storagePath: usedStorage ? storagePath : null,
    fileHash: fileHash || null,
    fileSize: fileSize || null,
    isLocalFallback: !usedStorage,
    uploadedBy: admin.username,
    uploadedById: admin.id,
    createdAt: new Date().toISOString()
  };

  const docRef = await addDoc(tracksCol, trackData);

  return {
    id: docRef.id,
    ...trackData
  };
}

/**
 * Probes and calculates audio duration from a direct URL (e.g. Catbox.moe, Dropbox, etc.)
 * 
 * @param {string} url Direct URL to audio file
 * @returns {Promise<number>} Duration in seconds (rounded to 1 decimal place), or 0 if unresolvable
 */
export async function calculateAudioDurationFromUrl(url) {
  if (!url || typeof url !== "string") return 0;
  let cleanUrl = url.trim();
  if (!cleanUrl) return 0;

  if (cleanUrl.includes("pixeldrain.com/u/")) {
    cleanUrl = cleanUrl.replace("pixeldrain.com/u/", "pixeldrain.com/api/file/");
  }
  if (cleanUrl.includes("dropbox.com") && cleanUrl.includes("dl=0")) {
    cleanUrl = cleanUrl.replace("dl=0", "raw=1");
  }

  return new Promise((resolve) => {
    let settled = false;
    const finish = (val) => {
      if (!settled) {
        settled = true;
        resolve(val > 0 ? Math.round(val * 10) / 10 : 0);
      }
    };

    // Primary method: HTML5 Audio metadata preload
    const audio = new Audio();
    audio.preload = "metadata";

    audio.onloadedmetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        finish(audio.duration);
      } else {
        fallbackFetch();
      }
    };

    audio.onerror = () => {
      fallbackFetch();
    };

    // Fallback method: fetch arrayBuffer & decodeAudioData
    async function fallbackFetch() {
      try {
        const res = await fetch(cleanUrl, { mode: "cors" });
        if (!res.ok) throw new Error("Fetch failed");
        const buf = await res.arrayBuffer();
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        const tempCtx = new AudioCtx();
        const decoded = await tempCtx.decodeAudioData(buf);
        tempCtx.close();
        finish(decoded.duration);
      } catch (err) {
        console.warn("Could not determine duration from URL:", err);
        finish(0);
      }
    }

    // Safety timeout (6 seconds)
    setTimeout(() => {
      if (!settled) finish(0);
    }, 6000);

    audio.src = cleanUrl;
  });
}

/**
 * Adds a track directly via URL.
 * Validates against non-audio links (like Spotify/YouTube) that cannot be streamed via Web Audio API.
 * Automatically resolves audio duration if not provided.
 * 
 * @param {object} params
 * @param {string} params.url Direct audio link (mp3, ogg, mp4, wav)
 * @param {string} params.title
 * @param {string} params.artist
 * @param {number} [params.duration]
 * @returns {Promise<object>}
 */
export async function addTrackByUrl({ url, title, artist, duration }) {
  const admin = requireAdmin();

  if (!url?.trim()) throw new Error(i18n.t("adminEnterUrlPrompt") || "Вкажіть пряме посилання на аудіофайл.");
  if (!title?.trim()) throw new Error(i18n.t("adminSpecifyTitle") || "Вкажіть назву треку.");
  if (!artist?.trim()) throw new Error(i18n.t("adminSpecifyArtist") || "Вкажіть автора / виконавця.");

  let cleanUrl = url.trim();

  // Auto-convert Pixeldrain web view URL to direct API stream URL
  if (cleanUrl.includes("pixeldrain.com/u/")) {
    cleanUrl = cleanUrl.replace("pixeldrain.com/u/", "pixeldrain.com/api/file/");
  }
  // Auto-convert Dropbox share URL to direct raw stream URL
  if (cleanUrl.includes("dropbox.com") && cleanUrl.includes("dl=0")) {
    cleanUrl = cleanUrl.replace("dl=0", "raw=1");
  }

  // Validate against Spotify and YouTube web player links
  if (cleanUrl.includes("spotify.com") || cleanUrl.includes("open.spotify")) {
    throw new Error(
      i18n.t("spotifyDrmError") ||
      "Spotify посилання не підтримуються, оскільки вони захищені DRM та блокують зовнішній доступ (CORS). " +
      "Будь ласка, завантажте аудіофайл на Catbox.moe або вкажіть пряме посилання на .mp3 файл."
    );
  }
  if (cleanUrl.includes("youtube.com") || cleanUrl.includes("youtu.be")) {
    throw new Error(
      i18n.t("youtubeDrmError") ||
      "YouTube посилання не є прямими аудіофайлами. " +
      "Будь ласка, завантажте аудіофайл на Catbox.moe або вкажіть пряме посилання на аудіофайл."
    );
  }

  let trackDuration = Number(duration) || 0;
  if (trackDuration <= 0) {
    try {
      trackDuration = await calculateAudioDurationFromUrl(cleanUrl);
    } catch (e) {
      console.warn("Auto duration calculation failed:", e);
    }
  }

  // Check for duplicate track in Firestore
  const tracksCol = collection(db, "tracks");
  const existingTracksSnap = await getDocs(tracksCol);
  const existingTracks = existingTracksSnap.docs.map(docSnap => ({
    id: docSnap.id,
    ...docSnap.data()
  }));

  const dupCheck = findDuplicateTrack(existingTracks, {
    url: cleanUrl,
    title,
    artist,
    duration: trackDuration
  });

  if (dupCheck.duplicate && dupCheck.track) {
    const d = dupCheck.track;
    const fullTrackName = `${d.artist ? d.artist + ' - ' : ''}${d.title}`;
    throw new Error(
      (i18n.t("trackAlreadyExistsName") || "Трек «{title}» уже є у фонотеці!")
        .replace("{title}", fullTrackName)
    );
  }

  const trackData = {
    title: title.trim(),
    artist: artist.trim(),
    duration: trackDuration,
    audioUrl: cleanUrl,
    storagePath: null,
    isLocalFallback: false,
    uploadedBy: admin.username,
    uploadedById: admin.id,
    createdAt: new Date().toISOString()
  };

  const docRef = await addDoc(tracksCol, trackData);

  return {
    id: docRef.id,
    ...trackData
  };
}

/**
 * Fetches all tracks from Firestore.
 * 
 * @returns {Promise<Array<object>>}
 */
export async function getAllTracks() {
  try {
    const tracksCol = collection(db, "tracks");
    const snapshot = await getDocs(tracksCol);
    
    const tracks = [];
    snapshot.forEach(docSnap => {
      tracks.push({
        id: docSnap.id,
        ...docSnap.data()
      });
    });

    // Sort newest first
    tracks.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return tracks;
  } catch (err) {
    console.error("Failed to load tracks from Firestore:", err);
    throw new Error("Не вдалося завантажити список треків: " + err.message);
  }
}

/**
 * Deletes a track from Firestore, Storage, and IndexedDB (Admin only).
 * 
 * @param {string} trackId 
 * @param {string|null} storagePath 
 * @param {string|null} audioUrl
 */
export async function deleteTrack(trackId, storagePath = null, audioUrl = null) {
  requireAdmin();

  if (!trackId) throw new Error("ID треку не вказано.");

  // 1. Delete from Firestore
  const trackDocRef = doc(db, "tracks", trackId);
  await deleteDoc(trackDocRef);

  // 2. Delete file from Storage if path exists
  if (storagePath) {
    if (storagePath.startsWith("tracks/")) {
      try {
        await deleteAudioFromSupabase(storagePath);
      } catch (sbErr) {
        console.warn("Supabase file could not be deleted:", sbErr);
      }
    } else {
      try {
        const fileRef = ref(storage, storagePath);
        await deleteObject(fileRef);
      } catch (storageErr) {
        console.warn("Storage file could not be deleted or already removed:", storageErr);
      }
    }
  }

  // 3. Delete from IndexedDB if stored locally
  if (audioUrl && audioUrl.startsWith("indexeddb://")) {
    try {
      const localId = audioUrl.replace("indexeddb://", "");
      await deleteAudioFromIndexedDB(localId);
    } catch (idbErr) {
      console.warn("IndexedDB track could not be deleted:", idbErr);
    }
  }

  return true;
}

/**
 * Updates an existing track in Firestore and optionally replaces its audio file in Supabase Storage.
 * Admin only.
 * 
 * @param {object} params
 * @param {string} params.trackId Firestore track document ID
 * @param {File} [params.file] Optional new audio file
 * @param {string} [params.title] Optional new or existing title
 * @param {string} [params.artist] Optional new or existing artist
 * @param {number} [params.duration] Optional duration
 * @param {string} [params.audioUrl] Optional manual URL
 * @param {string} [params.oldStoragePath] Old storage path to clean up
 * @param {function} [params.onProgress] Progress callback for file upload
 * @returns {Promise<object>} Updated track data
 */
export async function updateTrackAdmin({
  trackId,
  file = null,
  title = null,
  artist = null,
  duration = null,
  audioUrl = null,
  oldStoragePath = null,
  onProgress = () => {}
}) {
  const admin = requireAdmin();
  if (!trackId) throw new Error("ID треку не вказано.");

  const trackDocRef = doc(db, "tracks", trackId);
  const updateData = {
    updatedAt: new Date().toISOString(),
    updatedBy: admin.username
  };

  if (title && title.trim()) updateData.title = title.trim();
  if (artist && artist.trim()) updateData.artist = artist.trim();

  // If a new audio file is provided:
  if (file) {
    let calcDuration = Number(duration) || 0;
    if (calcDuration <= 0) {
      try {
        calcDuration = await calculateAudioDuration(file);
      } catch (e) {
        console.warn("Could not calculate duration for new file:", e);
      }
    }
    if (calcDuration > 0) {
      updateData.duration = calcDuration;
    }

    const fileHash = await calculateFileHash(file);
    const fileSize = file.size || 0;
    if (fileHash) updateData.fileHash = fileHash;
    if (fileSize > 0) updateData.fileSize = fileSize;

    // Save to local IndexedDB for instant offline/cache availability
    const trackLocalId = `track_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    try {
      await saveAudioToIndexedDB(trackLocalId, file);
    } catch (idbErr) {
      console.warn("IndexedDB caching warning:", idbErr);
    }

    // Upload new file to Supabase Cloud Storage
    const latinName = transliterate(file.name);
    try {
      const res = await uploadAudioToSupabase(file, latinName, onProgress);
      updateData.audioUrl = res.publicUrl;
      updateData.storagePath = res.storagePath;
      updateData.isLocalFallback = false;

      // Delete old file from Supabase if an old storagePath existed
      if (oldStoragePath && oldStoragePath !== res.storagePath) {
        try {
          if (oldStoragePath.startsWith("tracks/")) {
            await deleteAudioFromSupabase(oldStoragePath);
          } else {
            const oldFileRef = ref(storage, oldStoragePath);
            await deleteObject(oldFileRef);
          }
        } catch (cleanupErr) {
          console.warn("Could not delete old storage file:", cleanupErr);
        }
      }
    } catch (storageErr) {
      console.warn("Supabase upload failed, falling back to IndexedDB:", storageErr);
      updateData.audioUrl = `indexeddb://${trackLocalId}`;
      updateData.storagePath = null;
      updateData.isLocalFallback = true;
    }
  } else if (audioUrl && audioUrl.trim()) {
    // If a direct URL is specified
    let cleanUrl = audioUrl.trim();
    if (cleanUrl.includes("pixeldrain.com/u/")) {
      cleanUrl = cleanUrl.replace("pixeldrain.com/u/", "pixeldrain.com/api/file/");
    }
    if (cleanUrl.includes("dropbox.com") && cleanUrl.includes("dl=0")) {
      cleanUrl = cleanUrl.replace("dl=0", "raw=1");
    }

    updateData.audioUrl = cleanUrl;
    updateData.storagePath = null;
    updateData.isLocalFallback = false;

    let calcDuration = Number(duration) || 0;
    if (calcDuration <= 0) {
      try {
        calcDuration = await calculateAudioDurationFromUrl(cleanUrl);
      } catch (e) {
        console.warn("Could not calculate duration from URL:", e);
      }
    }
    if (calcDuration > 0) {
      updateData.duration = calcDuration;
    }

    // Delete old storage file if migrating from Supabase to URL
    if (oldStoragePath) {
      try {
        if (oldStoragePath.startsWith("tracks/")) {
          await deleteAudioFromSupabase(oldStoragePath);
        } else {
          const oldFileRef = ref(storage, oldStoragePath);
          await deleteObject(oldFileRef);
        }
      } catch (cleanupErr) {
        console.warn("Could not delete old storage file:", cleanupErr);
      }
    }
  } else if (duration !== null && duration !== undefined && Number(duration) > 0) {
    updateData.duration = Number(duration);
  }

  await updateDoc(trackDocRef, updateData);
  return { id: trackId, ...updateData };
}

/**
 * Completely deletes a player and all their associated data from Firestore:
 * - users/{userId}
 * - user_progress/{userId}
 * - global_leaderboard/{userId}
 * - secret_leaderboard (userId == userId and name == username)
 * - game_stats (userId == userId)
 * 
 * Requires admin privileges.
 * 
 * @param {string} userId
 * @param {string|null} username
 */
export async function deletePlayerAdmin(userId, username = null) {
  requireAdmin();
  if (!userId) throw new Error("ID гравця не вказано.");

  // Перевірка: захист акаунта адміністратора від видалення
  try {
    const userDocSnap = await getDoc(doc(db, "users", userId));
    if (userDocSnap.exists() && (userDocSnap.data()?.isAdmin || userDocSnap.data()?.role === 'admin')) {
      throw new Error(i18n.t("adminCannotBeDeleted", "Акаунт адміністратора захищено від видалення."));
    }
  } catch (err) {
    if (err.message && err.message.includes(i18n.t("adminCannotBeDeleted", "Акаунт адміністратора захищено від видалення."))) {
      throw err;
    }
    console.warn("Check admin status in deletePlayerAdmin error:", err);
  }

  // 1. Delete from users
  try {
    await deleteDoc(doc(db, "users", userId));
  } catch (e) {
    console.warn("Failed to delete user doc:", e);
  }

  // 2. Delete from user_progress
  try {
    await deleteDoc(doc(db, "user_progress", userId));
  } catch (e) {
    console.warn("Failed to delete user_progress doc:", e);
  }

  // 3. Delete from global_leaderboard
  try {
    await deleteDoc(doc(db, "global_leaderboard", userId));
  } catch (e) {
    console.warn("Failed to delete global_leaderboard doc:", e);
  }

  // 4. Delete from secret_leaderboard (by userId)
  try {
    const secQ1 = query(collection(db, "secret_leaderboard"), where("userId", "==", userId));
    const secSnap1 = await getDocs(secQ1);
    for (const d of secSnap1.docs) {
      try { await deleteDoc(doc(db, "secret_leaderboard", d.id)); } catch (err) {}
    }
  } catch (e) {
    console.warn("Failed to delete secret_leaderboard by userId:", e);
  }

  // Delete from secret_leaderboard (by username)
  if (username) {
    try {
      const secQ2 = query(collection(db, "secret_leaderboard"), where("name", "==", username));
      const secSnap2 = await getDocs(secQ2);
      for (const d of secSnap2.docs) {
        try { await deleteDoc(doc(db, "secret_leaderboard", d.id)); } catch (err) {}
      }
    } catch (e) {
      console.warn("Failed to delete secret_leaderboard by name:", e);
    }
  }

  // 5. Delete from game_stats (by userId)
  try {
    const statsQ = query(collection(db, "game_stats"), where("userId", "==", userId));
    const statsSnap = await getDocs(statsQ);
    for (const d of statsSnap.docs) {
      try { await deleteDoc(doc(db, "game_stats", d.id)); } catch (err) {}
    }
  } catch (e) {
    console.warn("Failed to delete game_stats records:", e);
  }

  return true;
}

/**
 * Updates a player's display name across all Firestore collections:
 * - users/{userId}
 * - user_progress/{userId}
 * - global_leaderboard/{userId}
 * - secret_leaderboard (userId == userId)
 * - game_stats (userId == userId)
 * 
 * Requires admin privileges.
 * 
 * @param {string} userId
 * @param {string} newName
 * @returns {Promise<boolean>}
 */
export async function updatePlayerNameAdmin(userId, newName) {
  requireAdmin();
  if (!userId) throw new Error("ID гравця не вказано.");
  const cleanName = (newName || "").trim();
  if (!cleanName) {
    throw new Error(i18n.t("adminPlayerNameEmptyError") || "Ім'я гравця не може бути порожнім.");
  }
  if (cleanName.length > 32) {
    throw new Error("Ім'я гравця занадто довге (макс. 32 символи).");
  }

  // 1. Update in users
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      await updateDoc(userRef, {
        name: cleanName,
        username: cleanName,
        displayName: cleanName,
        updatedAt: new Date()
      });
    }
  } catch (e) {
    console.warn("Failed to update user doc:", e);
  }

  // 2. Update in user_progress
  try {
    const progRef = doc(db, "user_progress", userId);
    const progSnap = await getDoc(progRef);
    if (progSnap.exists()) {
      await updateDoc(progRef, {
        name: cleanName,
        playerName: cleanName,
        updatedAt: new Date()
      });
    }
  } catch (e) {
    console.warn("Failed to update user_progress doc:", e);
  }

  // 3. Update in global_leaderboard
  try {
    const lbRef = doc(db, "global_leaderboard", userId);
    const lbSnap = await getDoc(lbRef);
    if (lbSnap.exists()) {
      await updateDoc(lbRef, {
        name: cleanName,
        playerName: cleanName,
        updatedAt: new Date()
      });
    }
  } catch (e) {
    console.warn("Failed to update global_leaderboard doc:", e);
  }

  // 4. Update in secret_leaderboard
  try {
    const secQ = query(collection(db, "secret_leaderboard"), where("userId", "==", userId));
    const secSnap = await getDocs(secQ);
    for (const d of secSnap.docs) {
      try {
        await updateDoc(doc(db, "secret_leaderboard", d.id), {
          name: cleanName,
          playerName: cleanName
        });
      } catch (err) {}
    }
  } catch (e) {
    console.warn("Failed to update secret_leaderboard records:", e);
  }

  // 5. Update in game_stats
  try {
    const statsQ = query(collection(db, "game_stats"), where("userId", "==", userId));
    const statsSnap = await getDocs(statsQ);
    for (const d of statsSnap.docs) {
      try {
        await updateDoc(doc(db, "game_stats", d.id), {
          name: cleanName,
          playerName: cleanName
        });
      } catch (err) {}
    }
  } catch (e) {
    console.warn("Failed to update game_stats records:", e);
  }

  return true;
}

/**
 * Fetches track metadata (title, artist, duration in seconds) from a Spotify track URL.
 * Uses multi-tier strategy (Microlink embed __NEXT_DATA__, Spotify oEmbed, iTunes search fallback)
 * to ensure 100% browser CORS compatibility without requiring Spotify API keys.
 * 
 * @param {string} spotifyUrl 
 * @returns {Promise<{ success: boolean, title: string, artist: string, duration: number, coverUrl?: string }>}
 */
export async function fetchSpotifyTrackMetadata(spotifyUrl) {
  if (!spotifyUrl || typeof spotifyUrl !== "string") {
    throw new Error(i18n.t("adminSpotifyError") || "Вкажіть посилання на трек Spotify.");
  }

  const cleanInput = spotifyUrl.trim();
  const trackIdMatch = cleanInput.match(/(?:spotify\.com(?:\/[a-zA-Z-]+)?\/track\/|spotify:track:|^)([a-zA-Z0-9]{22})(?:[/?#]|$)/i);
  const trackId = trackIdMatch ? trackIdMatch[1] : null;

  if (!trackId && !cleanInput.includes("spotify.com")) {
    throw new Error(i18n.t("adminSpotifyError") || "Невірний формат посилання Spotify. Очікується https://open.spotify.com/track/...");
  }

  let title = "";
  let artist = "";
  let duration = 0;
  let coverUrl = "";

  // Strategy 1: Microlink on Spotify Embed with __NEXT_DATA__ selector
  // Returns exact Spotify title, artist(s), cover image and millisecond duration
  if (trackId) {
    try {
      const embedUrl = `https://open.spotify.com/embed/track/${trackId}`;
      const microlinkUrl = `https://api.microlink.io/?url=${encodeURIComponent(embedUrl)}&data.raw.selector=script%23__NEXT_DATA__`;
      const resp = await fetch(microlinkUrl, { signal: AbortSignal.timeout(6000) });
      if (resp.ok) {
        const json = await resp.json();
        const entity = json?.data?.raw?.props?.pageProps?.state?.data?.entity;
        if (entity) {
          title = entity.name || entity.title || "";
          if (Array.isArray(entity.artists) && entity.artists.length > 0) {
            artist = entity.artists.map(a => a.name).filter(Boolean).join(", ");
          }
          if (entity.duration && typeof entity.duration === "number") {
            duration = Math.round(entity.duration / 100) / 10; // e.g. 213.6s
          }
          if (Array.isArray(entity.visualIdentity?.image) && entity.visualIdentity.image.length > 0) {
            coverUrl = entity.visualIdentity.image[0]?.url || "";
          }
        }
      }
    } catch (err) {
      console.warn("[Spotify] Embed Next.js fetch failed:", err);
    }
  }

  // Strategy 2: Official Spotify oEmbed endpoint (CORS enabled, highly reliable for track title)
  if (!title) {
    try {
      const cleanUrl = trackId ? `https://open.spotify.com/track/${trackId}` : cleanInput;
      const oembedUrl = `https://open.spotify.com/oembed?url=${encodeURIComponent(cleanUrl)}`;
      const resp = await fetch(oembedUrl, { signal: AbortSignal.timeout(5000) });
      if (resp.ok) {
        const json = await resp.json();
        if (json.title) title = json.title;
        if (json.thumbnail_url) coverUrl = coverUrl || json.thumbnail_url;
      }
    } catch (err) {
      console.warn("[Spotify] oEmbed fetch failed:", err);
    }
  }

  // Strategy 3: Microlink standard metadata
  if (!artist || !title) {
    try {
      const cleanUrl = trackId ? `https://open.spotify.com/track/${trackId}` : cleanInput;
      const microlinkUrl = `https://api.microlink.io/?url=${encodeURIComponent(cleanUrl)}`;
      const resp = await fetch(microlinkUrl, { signal: AbortSignal.timeout(5000) });
      if (resp.ok) {
        const json = await resp.json();
        if (json?.data) {
          if (!title && json.data.title) title = json.data.title;
          if (!artist && json.data.author) artist = json.data.author;
          if (!coverUrl && json.data.image?.url) coverUrl = json.data.image.url;
        }
      }
    } catch (err) {
      console.warn("[Spotify] Microlink standard fetch failed:", err);
    }
  }

  // Strategy 4: iTunes Search API fallback for artist and duration (CORS enabled, accurate track duration)
  if ((!duration || !artist) && title) {
    try {
      const query = artist ? `${artist} ${title}` : title;
      const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=1`;
      const resp = await fetch(itunesUrl, { signal: AbortSignal.timeout(5000) });
      if (resp.ok) {
        const json = await resp.json();
        const item = json.results?.[0];
        if (item) {
          if (!artist && item.artistName) artist = item.artistName;
          if (!duration && item.trackTimeMillis) {
            duration = Math.round(item.trackTimeMillis / 100) / 10;
          }
          if (!coverUrl && item.artworkUrl100) coverUrl = item.artworkUrl100;
        }
      }
    } catch (err) {
      console.warn("[Spotify] iTunes search fallback failed:", err);
    }
  }

  if (!title && !artist) {
    throw new Error(i18n.t("adminSpotifyError") || "Не вдалося отримати дані треку зі Spotify. Будь ласка, перевірте посилання.");
  }

  return {
    success: true,
    title: title.trim(),
    artist: artist.trim(),
    duration: duration > 0 ? duration : 0,
    coverUrl
  };
}

/**
 * Fetches YouTube and YouTube Music track metadata (Title, Artist, Duration, Cover) using 100% CORS-friendly
 * endpoints (official YouTube oEmbed, Noembed fallback, Microlink fallback, and iTunes Search API fallback for duration).
 * 
 * @param {string} youtubeUrl 
 * @returns {Promise<{ success: boolean, title: string, artist: string, duration: number, coverUrl?: string }>}
 */
export async function fetchYouTubeTrackMetadata(youtubeUrl) {
  if (!youtubeUrl || typeof youtubeUrl !== "string") {
    throw new Error(i18n.t("adminSpotifyError") || "Вкажіть посилання на трек YouTube / YouTube Music.");
  }

  const cleanInput = youtubeUrl.trim();
  const videoIdMatch = cleanInput.match(/(?:(?:music\.)?youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
  const videoId = videoIdMatch ? videoIdMatch[1] : (cleanInput.length === 11 && /^[a-zA-Z0-9_-]{11}$/.test(cleanInput) ? cleanInput : null);

  if (!videoId && !cleanInput.includes("youtube.com") && !cleanInput.includes("youtu.be")) {
    throw new Error(i18n.t("adminSpotifyError") || "Невірний формат посилання YouTube Music. Очікується https://music.youtube.com/watch?v=...");
  }

  let rawTitle = "";
  let rawAuthor = "";
  let coverUrl = videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : "";

  // Strategy 1: Official YouTube oEmbed API (supports CORS directly from browser)
  if (videoId) {
    try {
      const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
      const resp = await fetch(oembedUrl, { signal: AbortSignal.timeout(5000) });
      if (resp.ok) {
        const json = await resp.json();
        if (json.title) rawTitle = json.title;
        if (json.author_name) rawAuthor = json.author_name;
        if (json.thumbnail_url) coverUrl = json.thumbnail_url;
      }
    } catch (err) {
      console.warn("[YouTube] Official oEmbed failed:", err);
    }
  }

  // Strategy 2: Noembed fallback (public CORS-friendly oEmbed proxy)
  if (!rawTitle && videoId) {
    try {
      const noembedUrl = `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`;
      const resp = await fetch(noembedUrl, { signal: AbortSignal.timeout(5000) });
      if (resp.ok) {
        const json = await resp.json();
        if (json.title) rawTitle = json.title;
        if (json.author_name) rawAuthor = json.author_name;
        if (json.thumbnail_url) coverUrl = json.thumbnail_url;
      }
    } catch (err) {
      console.warn("[YouTube] Noembed fallback failed:", err);
    }
  }

  // Strategy 3: Microlink fallback
  if (!rawTitle) {
    try {
      const target = videoId ? `https://www.youtube.com/watch?v=${videoId}` : cleanInput;
      const microlinkUrl = `https://api.microlink.io/?url=${encodeURIComponent(target)}`;
      const resp = await fetch(microlinkUrl, { signal: AbortSignal.timeout(5000) });
      if (resp.ok) {
        const json = await resp.json();
        if (json?.data) {
          if (json.data.title) rawTitle = json.data.title;
          if (json.data.author) rawAuthor = json.data.author;
          if (json.data.image?.url) coverUrl = json.data.image.url;
        }
      }
    } catch (err) {
      console.warn("[YouTube] Microlink fallback failed:", err);
    }
  }

  // Smart Parsing of Artist and Track Title:
  let parsedArtist = "";
  let parsedTitle = "";

  // 1. If author has " - Topic" (YouTube Music auto-generated artist topic channels), clean it
  let cleanAuthor = rawAuthor ? rawAuthor.replace(/\s*-\s*Topic$/i, "").trim() : "";

  if (rawTitle) {
    // Check if title has "Artist - Title" format
    const dashMatch = rawTitle.match(/^(.+?)\s*[-–—]\s*(.+)$/);
    if (dashMatch) {
      parsedArtist = dashMatch[1].trim();
      parsedTitle = dashMatch[2].trim();
    } else {
      parsedTitle = rawTitle.trim();
      parsedArtist = cleanAuthor;
    }
  }

  // 2. Remove typical YouTube video noise words from the track title
  parsedTitle = parsedTitle
    .replace(/[\(\[]\s*(?:Official\s*(?:Music\s*)?(?:Video|Audio|Visualizer|Lyric\s*Video)|Music\s*Video|Lyric\s*Video|Lyrics|Audio|Visualizer|MV|4K|Remaster(?:ed)?|HD|HQ)\b[^\)\]]*[\)\]]/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();

  // 3. Clean common channel suffixes like VEVO or Official Channel
  if (parsedArtist) {
    parsedArtist = parsedArtist
      .replace(/(?:VEVO|Official(?:\s*(?:Channel|Music|Video))?)$/i, "")
      .trim();
  }

  let duration = 0;

  // Strategy 4: iTunes Search API fallback to obtain exact duration and HD album cover
  if (parsedTitle) {
    try {
      const query = parsedArtist ? `${parsedArtist} ${parsedTitle}` : parsedTitle;
      const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=1`;
      const resp = await fetch(itunesUrl, { signal: AbortSignal.timeout(5000) });
      if (resp.ok) {
        const json = await resp.json();
        const item = json.results?.[0];
        if (item) {
          if (item.trackTimeMillis) {
            duration = Math.round(item.trackTimeMillis / 100) / 10;
          }
          if (!parsedArtist && item.artistName) {
            parsedArtist = item.artistName;
          }
          if (item.artworkUrl100) {
            coverUrl = item.artworkUrl100.replace("100x100bb", "600x600bb");
          }
        }
      }
    } catch (err) {
      console.warn("[YouTube] iTunes search fallback failed:", err);
    }
  }

  if (!parsedTitle && !parsedArtist) {
    throw new Error(i18n.t("adminSpotifyError") || "Не вдалося отримати дані треку з YouTube. Будь ласка, перевірте посилання.");
  }

  return {
    success: true,
    title: parsedTitle.trim(),
    artist: parsedArtist.trim(),
    duration: duration > 0 ? duration : 0,
    coverUrl
  };
}

/**
 * Automatically detects whether a URL is from Spotify or YouTube / YouTube Music
 * and extracts track metadata accordingly.
 * 
 * @param {string} url 
 * @returns {Promise<{ success: boolean, title: string, artist: string, duration: number, coverUrl?: string }>}
 */
export async function fetchMusicTrackMetadata(url) {
  if (!url || typeof url !== "string") {
    throw new Error(i18n.t("adminSpotifyError") || "Вкажіть посилання на трек.");
  }

  const trimmed = url.trim();
  if (trimmed.includes("spotify.com") || trimmed.includes("spotify:")) {
    return await fetchSpotifyTrackMetadata(trimmed);
  } else if (trimmed.includes("youtube.com") || trimmed.includes("youtu.be") || trimmed.includes("music.youtube")) {
    return await fetchYouTubeTrackMetadata(trimmed);
  }

  // If 22 alphanumeric characters, likely a Spotify Track ID
  if (/^[a-zA-Z0-9]{22}$/.test(trimmed)) {
    return await fetchSpotifyTrackMetadata(trimmed);
  }

  // If 11 characters (alphanumeric, dash, underscore), likely a YouTube Video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return await fetchYouTubeTrackMetadata(trimmed);
  }

  // Fallback: try Spotify first, then YouTube
  try {
    return await fetchSpotifyTrackMetadata(trimmed);
  } catch (spotifyErr) {
    try {
      return await fetchYouTubeTrackMetadata(trimmed);
    } catch (ytErr) {
      throw new Error(i18n.t("adminSpotifyError") || "Не вдалося розпізнати посилання. Вкажіть дійсне посилання Spotify або YouTube Music.");
    }
  }
}

/**
 * Fetches theme customization & discount settings from Firestore (with localStorage fallback).
 * 
 * @returns {Promise<object>}
 */
export async function getThemeSettings() {
  let cached = {};
  try {
    const raw = localStorage.getItem('neon_theme_overrides');
    if (raw) cached = JSON.parse(raw);
  } catch (e) {}

  try {
    const docRef = doc(db, "system_configs", "theme_settings");
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() || {};
      localStorage.setItem('neon_theme_overrides', JSON.stringify(data));
      return data;
    }
  } catch (err) {
    console.warn("getThemeSettings firestore warning:", err);
  }

  return cached;
}

/**
 * Saves theme customization & discount settings to Firestore and local storage.
 * Requires admin privileges.
 * 
 * @param {object} settings
 * @returns {Promise<boolean>}
 */
export async function saveThemeSettings(settings = {}) {
  requireAdmin();
  if (!settings || typeof settings !== 'object') {
    throw new Error("Invalid settings object");
  }

  // 1. Save to local storage
  localStorage.setItem('neon_theme_overrides', JSON.stringify(settings));

  // 2. Save to Firestore
  const docRef = doc(db, "system_configs", "theme_settings");
  await setDoc(docRef, settings, { merge: true });

  return true;
}

