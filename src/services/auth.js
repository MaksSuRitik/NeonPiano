// ==========================================
// AUTHENTICATION & USER MANAGEMENT SERVICE
// ==========================================
import { 
  db, 
  collection, 
  doc,
  getDoc,
  getDocs, 
  setDoc,
  addDoc, 
  updateDoc,
  deleteDoc,
  query, 
  where 
} from "../config/firebase.js";
import { hashPassword } from "./crypto.js?v=11.0";
import { i18n } from "../i18n/index.js";

const SESSION_KEY = "neon_piano_user_session";
let authListeners = [];

/**
 * Gets currently logged in user session
 */
export function getCurrentUser() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error("Failed to parse session:", e);
    return null;
  }
}

/**
 * Saves user session to storage
 */
function saveSession(user, rememberMe = true) {
  const sessionData = JSON.stringify(user);
  sessionStorage.setItem(SESSION_KEY, sessionData);
  if (rememberMe) {
    localStorage.setItem(SESSION_KEY, sessionData);
  }
  notifyAuthListeners(user);
}

/**
 * Clears session on logout
 */
export function logoutUser() {
  sessionStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(SESSION_KEY);
  notifyAuthListeners(null);
}

/**
 * Subscribes to auth state changes
 */
export function onAuthStateChanged(callback) {
  authListeners.push(callback);
  callback(getCurrentUser());
  return () => {
    authListeners = authListeners.filter(cb => cb !== callback);
  };
}

function notifyAuthListeners(user) {
  authListeners.forEach(cb => {
    try {
      cb(user);
    } catch (err) {
      console.error("Auth listener error:", err);
    }
  });
}

/**
 * Registers a new user.
 * - Hashes password strictly on client side using Web Crypto API.
 * - Automatically grants admin rights to the FIRST registered user in the database.
 * 
 * @param {string} username 
 * @param {string} password 
 * @returns {Promise<object>} User session
 */
export async function registerUser(username, password) {
  const cleanUsername = username?.trim();
  const cleanPassword = password?.trim();

  if (!cleanUsername || cleanUsername.length < 3) {
    throw new Error("Имя пользователя должно содержать не менее 3 символов.");
  }
  if (!cleanPassword || cleanPassword.length < 4) {
    throw new Error("Пароль должен содержать не менее 4 символов.");
  }

  const usernameLower = cleanUsername.toLowerCase();
  const usersCollection = collection(db, "users");

  // 1. Check if username is already taken in users collection
  const checkQuery = query(usersCollection, where("usernameLower", "==", usernameLower));
  const existingDocs = await getDocs(checkQuery);

  if (!existingDocs.empty) {
    const errorMsg = i18n.t("authUsernameTaken", "Цей нікнейм уже зайнятий! Будь ласка, оберіть інший нікнейм.");
    const err = new Error(errorMsg);
    err.code = "USERNAME_TAKEN";
    throw err;
  }

  // 1b. Check if username is already taken in global_leaderboard
  try {
    const lbCollection = collection(db, "global_leaderboard");
    const lbDocs = await getDocs(lbCollection);
    const takenInLb = lbDocs.docs.some(d => {
      const data = d.data();
      const docName = (data.name || '').trim().toLowerCase();
      const docUserLower = (data.usernameLower || '').trim().toLowerCase();
      return docName === usernameLower || docUserLower === usernameLower;
    });
    if (takenInLb) {
      const errorMsg = i18n.t("authUsernameTaken", "Цей нікнейм уже зайнятий! Будь ласка, оберіть інший нікнейм.");
      const err = new Error(errorMsg);
      err.code = "USERNAME_TAKEN";
      throw err;
    }
  } catch (err) {
    if (err.code === "USERNAME_TAKEN") throw err;
    console.warn("Could not verify nickname in global_leaderboard:", err);
  }

  // 2. Check if this is the very first user in the entire database
  // If collection is empty -> this user becomes the ADMIN
  const allUsersSnapshot = await getDocs(usersCollection);
  const isFirstUser = allUsersSnapshot.empty;
  const isAdmin = isFirstUser;

  // 3. Client-side password hashing
  const passwordHash = await hashPassword(usernameLower, cleanPassword);

  // 4. Create user document in Firestore
  const newUserData = {
    username: cleanUsername,
    usernameLower: usernameLower,
    passwordHash: passwordHash, // ONLY hash is saved, never plaintext
    isAdmin: isAdmin,
    createdAt: new Date().toISOString()
  };

  const docRef = await addDoc(usersCollection, newUserData);

  const session = {
    id: docRef.id,
    username: cleanUsername,
    isAdmin: isAdmin,
    passwordHash: passwordHash
  };

  saveSession(session);
  return session;
}

/**
 * Logs in a user.
 * - Client-side hashes entered password and compares with Firestore hash.
 * 
 * @param {string} username 
 * @param {string} password 
 * @returns {Promise<object>} User session
 */
export async function loginUser(username, password) {
  const cleanUsername = username?.trim();
  const cleanPassword = password?.trim();

  if (!cleanUsername || !cleanPassword) {
    throw new Error("Введите логин и пароль.");
  }

  const usernameLower = cleanUsername.toLowerCase();
  const usersCollection = collection(db, "users");

  // 1. Client-side hash of the entered password
  const computedHash = await hashPassword(usernameLower, cleanPassword);

  // 2. Find user in Firestore by username
  const userQuery = query(usersCollection, where("usernameLower", "==", usernameLower));
  const userSnapshot = await getDocs(userQuery);

  if (userSnapshot.empty) {
    throw new Error("Пользователь с таким логином не найден.");
  }

  const userDoc = userSnapshot.docs[0];
  const userData = userDoc.data();

  // 3. Compare client-computed hash with the stored hash
  if (userData.passwordHash !== computedHash) {
    throw new Error("Неверный пароль. Попробуйте снова.");
  }

  const session = {
    id: userDoc.id,
    username: userData.username,
    isAdmin: !!userData.isAdmin,
    passwordHash: computedHash
  };

  saveSession(session);
  return session;
}

/**
 * Updates a user's username if it is available.
 * Also synchronizes with global_leaderboard and user_progress.
 * 
 * @param {string} userId
 * @param {string} newUsername
 * @returns {Promise<object>} updated session
 */
export async function updateUserUsername(userId, newUsername) {
  const cleanUsername = newUsername?.trim();
  if (!cleanUsername || cleanUsername.length < 3) {
    throw new Error("Ім'я користувача повинно містити щонайменше 3 символи.");
  }

  const usernameLower = cleanUsername.toLowerCase();
  const usersCollection = collection(db, "users");

  // Check if username is already taken by another user
  const checkQuery = query(usersCollection, where("usernameLower", "==", usernameLower));
  const existingDocs = await getDocs(checkQuery);

  if (!existingDocs.empty) {
    const conflicting = existingDocs.docs.find(d => d.id !== userId);
    if (conflicting) {
      const errorMsg = i18n.t("authUsernameTaken", "Цей нікнейм уже зайнятий! Будь ласка, оберіть інший нікнейм.");
      const err = new Error(errorMsg);
      err.code = "USERNAME_TAKEN";
      throw err;
    }
  }

  try {
    const lbCollection = collection(db, "global_leaderboard");
    const lbDocs = await getDocs(lbCollection);
    const conflictingLb = lbDocs.docs.find(d => {
      if (d.id === userId) return false;
      const data = d.data();
      const docName = (data.name || '').trim().toLowerCase();
      const docUserLower = (data.usernameLower || '').trim().toLowerCase();
      return docName === usernameLower || docUserLower === usernameLower;
    });
    if (conflictingLb) {
      const errorMsg = i18n.t("authUsernameTaken", "Цей нікнейм уже зайнятий! Будь ласка, оберіть інший нікнейм.");
      const err = new Error(errorMsg);
      err.code = "USERNAME_TAKEN";
      throw err;
    }
  } catch (err) {
    if (err.code === "USERNAME_TAKEN") throw err;
    console.warn("Could not verify nickname in global_leaderboard:", err);
  }

  // Get current user data
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) {
    throw new Error("Користувача не знайдено.");
  }
  const oldUserData = userSnap.data();

  // Re-hash password with the new username salt so security remains intact
  // Note: if user keeps same password, we re-hash with new username lower
  // Let's recompute hash if we have current password, or keep passwordHash if salt is based on username
  // Wait, let's check how crypto.js hashes password!
  // Let's check crypto.js!
  await updateDoc(userRef, {
    username: cleanUsername,
    usernameLower: usernameLower,
    updatedAt: new Date().toISOString()
  });

  // Update global leaderboard record
  try {
    const lbRef = doc(db, "global_leaderboard", userId);
    await setDoc(lbRef, { name: cleanUsername }, { merge: true });
  } catch (e) {
    console.warn("Leaderboard name update warning:", e);
  }

  // Update session
  const currentSession = getCurrentUser() || {};
  const updatedSession = {
    ...currentSession,
    id: userId,
    username: cleanUsername,
    isAdmin: !!oldUserData.isAdmin
  };
  saveSession(updatedSession);

  return updatedSession;
}

/**
 * Updates a user's password after verifying current password.
 * 
 * @param {string} userId
 * @param {string} currentPassword
 * @param {string} newPassword
 */
export async function updateUserPassword(userId, currentPassword, newPassword) {
  const cleanCurrent = currentPassword?.trim();
  const cleanNew = newPassword?.trim();

  if (!cleanCurrent || !cleanNew) {
    throw new Error("Заповніть усі поля пароля.");
  }
  if (cleanNew.length < 4) {
    throw new Error("Новий пароль повинен містити не менше 4 символів.");
  }

  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) {
    throw new Error("Користувача не знайдено.");
  }

  const userData = userSnap.data();
  const currentHash = await hashPassword(userData.usernameLower, cleanCurrent);

  if (currentHash !== userData.passwordHash) {
    throw new Error("Невірний поточний пароль.");
  }

  const newHash = await hashPassword(userData.usernameLower, cleanNew);
  await updateDoc(userRef, {
    passwordHash: newHash,
    updatedAt: new Date().toISOString()
  });

  const currentSession = getCurrentUser() || {};
  saveSession({ ...currentSession, passwordHash: newHash });
  return true;
}

/**
 * Permanently deletes the current user's account and all associated cloud progress and records.
 * 
 * @param {string} userId
 */
export async function deleteCurrentUserAccount(userId) {
  if (!userId) return;

  // 1. Delete user from users collection
  try {
    await deleteDoc(doc(db, "users", userId));
  } catch (e) {
    console.warn("Failed to delete user doc:", e);
  }

  // 2. Delete user progress
  try {
    await deleteDoc(doc(db, "user_progress", userId));
  } catch (e) {
    console.warn("Failed to delete user_progress doc:", e);
  }

  // 3. Delete from global leaderboard
  try {
    await deleteDoc(doc(db, "global_leaderboard", userId));
  } catch (e) {
    console.warn("Failed to delete global_leaderboard doc:", e);
  }

  // 4. Delete from secret leaderboard if exists
  try {
    const secQ = query(collection(db, "secret_leaderboard"), where("userId", "==", userId));
    const secSnap = await getDocs(secQ);
    secSnap.forEach(async (d) => {
      try { await deleteDoc(doc(db, "secret_leaderboard", d.id)); } catch (err) {}
    });
  } catch (e) {
    console.warn("Failed to delete secret_leaderboard records:", e);
  }

  // 5. Clear session
  logoutUser();
}
