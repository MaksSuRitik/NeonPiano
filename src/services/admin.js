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
  addDoc,
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
import { i18n } from "../i18n/index.js";

/**
 * Transliterates Cyrillic text to safe Latin characters for filenames.
 */
function transliterate(str) {
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
  const tracksCol = collection(db, "tracks");
  const existingTracksSnap = await getDocs(tracksCol);
  const cleanTitle = title.trim().toLowerCase();
  const cleanArtist = artist.trim().toLowerCase();

  for (const docSnap of existingTracksSnap.docs) {
    const d = docSnap.data();
    if (!d) continue;
    const dTitle = (d.title || "").trim().toLowerCase();
    const dArtist = (d.artist || "").trim().toLowerCase();
    if (dTitle === cleanTitle && dArtist === cleanArtist) {
      const fullTrackName = `${d.artist ? d.artist + ' - ' : ''}${d.title}`;
      throw new Error(
        (i18n.t("trackAlreadyExistsName") || "Трек «{title}» уже є у фонотеці!")
          .replace("{title}", fullTrackName)
      );
    }
  }

  const trackLocalId = `track_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  // 1. Always save raw audio binary to local IndexedDB first (guarantees 100% offline & instant fallback)
  try {
    await saveAudioToIndexedDB(trackLocalId, file);
  } catch (idbErr) {
    console.warn("IndexedDB caching warning:", idbErr);
  }

  // 2. Try to upload to Firebase Cloud Storage
  const latinName = transliterate(file.name);
  const cleanName = latinName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storagePath = `tracks/${Date.now()}_${cleanName}`;
  const storageRef = ref(storage, storagePath);

  let downloadUrl = null;
  let usedStorage = false;

  try {
    const uploadTask = uploadBytesResumable(storageRef, file);

    await new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          if (snapshot.totalBytes > 0) {
            const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
            onProgress(percent);
          }
        },
        (error) => {
          console.warn("Firebase Storage upload task error:", error);
          reject(error);
        },
        async () => {
          try {
            downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            usedStorage = true;
            resolve();
          } catch (e) {
            reject(e);
          }
        }
      );
    });
  } catch (storageErr) {
    console.warn("Firebase Storage upload failed, falling back to IndexedDB local storage:", storageErr);
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
  const cleanTitle = title.trim().toLowerCase();
  const cleanArtist = artist.trim().toLowerCase();
  const normalizedUrl = cleanUrl.toLowerCase().replace(/\/$/, '');

  for (const docSnap of existingTracksSnap.docs) {
    const d = docSnap.data();
    if (!d) continue;

    // Check by audio URL
    if (d.audioUrl) {
      const existingUrl = d.audioUrl.trim().toLowerCase().replace(/\/$/, '');
      if (existingUrl === normalizedUrl) {
        const fullTrackName = `${d.artist ? d.artist + ' - ' : ''}${d.title}`;
        throw new Error(
          (i18n.t("trackAlreadyExistsUrl") || "Трек з таким аудіо-посиланням уже є у фонотеці ({title})!")
            .replace("{title}", fullTrackName)
        );
      }
    }

    // Check by Title + Artist
    const dTitle = (d.title || "").trim().toLowerCase();
    const dArtist = (d.artist || "").trim().toLowerCase();
    if (dTitle === cleanTitle && dArtist === cleanArtist) {
      const fullTrackName = `${d.artist ? d.artist + ' - ' : ''}${d.title}`;
      throw new Error(
        (i18n.t("trackAlreadyExistsName") || "Трек «{title}» уже є у фонотеці!")
          .replace("{title}", fullTrackName)
      );
    }
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
    try {
      const fileRef = ref(storage, storagePath);
      await deleteObject(fileRef);
    } catch (storageErr) {
      console.warn("Storage file could not be deleted or already removed:", storageErr);
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

