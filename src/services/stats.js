// ==========================================
// STATS SERVICE: CLIENT-SIDE ENCRYPTED GAME STATS
// ==========================================
import { 
  db, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where 
} from "../config/firebase.js";
import { getCurrentUser } from "./auth.js";
import { encryptGameStats, decryptGameStats } from "./crypto.js";

/**
 * Saves game results to Firestore with mandatory client-side encryption.
 * 
 * @param {object} gameResult
 * @param {string} gameResult.trackId
 * @param {string} gameResult.trackTitle
 * @param {number} gameResult.score
 * @param {number} gameResult.maxCombo
 * @param {number} gameResult.accuracy
 * @param {number} gameResult.perfectCount
 * @param {number} gameResult.goodCount
 * @param {number} gameResult.missCount
 * @returns {Promise<object>}
 */
export async function saveGameStats(gameResult) {
  const user = getCurrentUser();
  if (!user) {
    throw new Error("Необходимо авторизоваться для сохранения статистики.");
  }

  // Raw statistics object
  const rawStats = {
    userId: user.id,
    username: user.username,
    trackId: gameResult.trackId || "track_unknown",
    trackTitle: gameResult.trackTitle || "Неизвестный трек",
    score: Number(gameResult.score) || 0,
    maxCombo: Number(gameResult.maxCombo) || 0,
    accuracy: Number(gameResult.accuracy) || 0,
    perfectCount: Number(gameResult.perfectCount) || 0,
    goodCount: Number(gameResult.goodCount) || 0,
    missCount: Number(gameResult.missCount) || 0,
    playedAt: new Date().toISOString()
  };

  // 1. Client-side encryption before pushing to Firestore
  const { cipherText, iv } = await encryptGameStats(rawStats, user.passwordHash);

  // 2. Encrypted payload stored in Firestore
  const encryptedDocument = {
    userId: user.id,
    username: user.username,
    trackId: rawStats.trackId,
    encryptedData: cipherText,
    iv: iv,
    createdAt: rawStats.playedAt
  };

  const statsCol = collection(db, "game_stats");
  const docRef = await addDoc(statsCol, encryptedDocument);

  return {
    id: docRef.id,
    decryptedStats: rawStats
  };
}

/**
 * Loads and decrypts the current user's personal game history.
 * 
 * @returns {Promise<Array<object>>} Array of decrypted game stats
 */
export async function getUserStats() {
  const user = getCurrentUser();
  if (!user) return [];

  try {
    const statsCol = collection(db, "game_stats");
    const userQuery = query(statsCol, where("userId", "==", user.id));
    const snapshot = await getDocs(userQuery);

    const results = [];
    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      try {
        // Decrypt with user's client key
        const decrypted = await decryptGameStats(data.encryptedData, data.iv, user.passwordHash);
        results.push({
          id: docSnap.id,
          ...decrypted
        });
      } catch (decryptErr) {
        console.warn("Could not decrypt stat entry:", docSnap.id, decryptErr);
      }
    }

    // Sort by playedAt descending
    results.sort((a, b) => new Date(b.playedAt || 0) - new Date(a.playedAt || 0));
    return results;
  } catch (err) {
    console.error("Failed to load user stats:", err);
    throw new Error("Ошибка загрузки статистики: " + err.message);
  }
}
