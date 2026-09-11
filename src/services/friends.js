// ==========================================
// FRIENDS MANAGEMENT SERVICE
// Firestore synchronization + LocalStorage Fallback
// Bidirectional Friend Request & Confirmation System
// ==========================================
import { db, doc, getDoc, setDoc, collection, getDocs, serverTimestamp } from "../config/firebase.js";
import { getCurrentUser } from "./auth.js?v=11.0";

let cachedFriends = [];
let cachedIncomingRequests = [];
let cachedOutgoingRequests = [];
let activeUserId = null;

function getFriendsKey(userId) {
  return `neon_friends_${userId || 'guest'}`;
}
function getIncomingKey(userId) {
  return `neon_friend_incoming_${userId || 'guest'}`;
}
function getOutgoingKey(userId) {
  return `neon_friend_outgoing_${userId || 'guest'}`;
}

/**
 * Loads friends and requests list from Firestore, falling back to LocalStorage
 */
export async function loadUserFriends(userId = null) {
  const curUser = getCurrentUser();
  const uid = userId || curUser?.id || localStorage.getItem('playerId');
  if (!uid) {
    cachedFriends = [];
    cachedIncomingRequests = [];
    cachedOutgoingRequests = [];
    return { friends: [], incomingRequests: [], outgoingRequests: [] };
  }
  activeUserId = uid;

  // 1. Load immediately from local cache
  try {
    const localF = localStorage.getItem(getFriendsKey(uid));
    if (localF) cachedFriends = JSON.parse(localF);

    const localInc = localStorage.getItem(getIncomingKey(uid));
    if (localInc) cachedIncomingRequests = JSON.parse(localInc);

    const localOut = localStorage.getItem(getOutgoingKey(uid));
    if (localOut) cachedOutgoingRequests = JSON.parse(localOut);
  } catch (e) {
    console.warn("[Friends] Error loading local cache:", e);
  }

  // 2. Sync from Firestore
  try {
    const friendDocRef = doc(db, "user_friends", uid);
    const snap = await getDoc(friendDocRef);
    if (snap.exists()) {
      const data = snap.data();
      if (Array.isArray(data.friends)) {
        cachedFriends = data.friends;
        localStorage.setItem(getFriendsKey(uid), JSON.stringify(cachedFriends));
      }
      if (Array.isArray(data.incomingRequests)) {
        cachedIncomingRequests = data.incomingRequests;
        localStorage.setItem(getIncomingKey(uid), JSON.stringify(cachedIncomingRequests));
      }
      if (Array.isArray(data.outgoingRequests)) {
        cachedOutgoingRequests = data.outgoingRequests;
        localStorage.setItem(getOutgoingKey(uid), JSON.stringify(cachedOutgoingRequests));
      }
    }
  } catch (err) {
    console.warn("[Friends] Could not sync with Firestore, using local cache:", err);
  }

  return {
    friends: [...cachedFriends],
    incomingRequests: [...cachedIncomingRequests],
    outgoingRequests: [...cachedOutgoingRequests]
  };
}

export function getCachedFriends() {
  return [...cachedFriends];
}

export function getCachedIncomingRequests() {
  return [...cachedIncomingRequests];
}

export function getCachedOutgoingRequests() {
  return [...cachedOutgoingRequests];
}

export function isFriend(targetId) {
  if (!targetId) return false;
  return cachedFriends.some(f => f.id === targetId || f.userId === targetId);
}

export function hasOutgoingRequest(targetId) {
  if (!targetId) return false;
  return cachedOutgoingRequests.some(r => r.toId === targetId || r.id === targetId);
}

export function hasIncomingRequest(targetId) {
  if (!targetId) return false;
  return cachedIncomingRequests.some(r => r.fromId === targetId || r.id === targetId);
}

/**
 * Sends a friend request to a target player
 */
export async function sendFriendRequest(targetId, targetName = null) {
  const curUser = getCurrentUser();
  const uid = curUser?.id || localStorage.getItem('playerId');
  const myName = (curUser?.username || localStorage.getItem('playerName') || 'Player').trim().toLowerCase();

  if (!uid) throw new Error("Користувач не авторизований");
  if (uid === targetId || (targetName && targetName.trim().toLowerCase() === myName)) {
    throw new Error("Ви не можете додати самого себе у друзі");
  }
  if (isFriend(targetId)) throw new Error("Цей гравець уже є у ваших друзях");
  if (hasOutgoingRequest(targetId)) throw new Error("Запит уже надіслано і очікує підтвердження");

  // If target already sent an incoming request to me, auto-accept it!
  if (hasIncomingRequest(targetId)) {
    return await acceptFriendRequest(targetId);
  }

  // Resolve target player name if missing
  let resolvedTargetName = targetName;
  if (!resolvedTargetName) {
    try {
      const uSnap = await getDoc(doc(db, "users", targetId));
      if (uSnap.exists()) {
        resolvedTargetName = uSnap.data().username || uSnap.data().name;
      }
    } catch (_) {}

    if (!resolvedTargetName) {
      try {
        const lbSnap = await getDoc(doc(db, "global_leaderboard", targetId));
        if (lbSnap.exists()) {
          resolvedTargetName = lbSnap.data().name;
        }
      } catch (_) {}
    }
  }
  resolvedTargetName = resolvedTargetName || ("Player_" + targetId.slice(0, 5));

  // 1. Update current user's outgoing requests
  const outgoingItem = {
    toId: targetId,
    toName: resolvedTargetName,
    requestedAt: Date.now()
  };
  cachedOutgoingRequests = [outgoingItem, ...cachedOutgoingRequests.filter(r => r.toId !== targetId)];
  localStorage.setItem(getOutgoingKey(uid), JSON.stringify(cachedOutgoingRequests));

  try {
    await setDoc(doc(db, "user_friends", uid), {
      userId: uid,
      outgoingRequests: cachedOutgoingRequests,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (err) {
    console.error("[Friends] Error saving outgoing request:", err);
  }

  // 2. Deliver incoming request to target player's Firestore document
  try {
    const targetDocRef = doc(db, "user_friends", targetId);
    const targetSnap = await getDoc(targetDocRef);
    let targetIncoming = [];
    if (targetSnap.exists()) {
      targetIncoming = targetSnap.data().incomingRequests || [];
    }
    const incomingItem = {
      fromId: uid,
      fromName: myName,
      requestedAt: Date.now()
    };
    targetIncoming = [incomingItem, ...targetIncoming.filter(r => r.fromId !== uid)];

    await setDoc(targetDocRef, {
      userId: targetId,
      incomingRequests: targetIncoming,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (err) {
    console.warn("[Friends] Could not deliver incoming request to target doc directly:", err);
  }

  return { success: true, targetName: resolvedTargetName };
}

/**
 * Accepts an incoming friend request
 */
export async function acceptFriendRequest(senderId) {
  const curUser = getCurrentUser();
  const uid = curUser?.id || localStorage.getItem('playerId');
  const myName = curUser?.username || localStorage.getItem('playerName') || 'Player';

  if (!uid) throw new Error("Користувач не авторизований");

  const req = cachedIncomingRequests.find(r => r.fromId === senderId || r.id === senderId);
  const senderName = req?.fromName || ("Player_" + senderId.slice(0, 5));

  // 1. Update current user: remove from incoming, add to friends
  cachedIncomingRequests = cachedIncomingRequests.filter(r => r.fromId !== senderId && r.id !== senderId);
  localStorage.setItem(getIncomingKey(uid), JSON.stringify(cachedIncomingRequests));

  const newFriend = {
    id: senderId,
    name: senderName,
    addedAt: Date.now()
  };
  cachedFriends = [newFriend, ...cachedFriends.filter(f => f.id !== senderId)];
  localStorage.setItem(getFriendsKey(uid), JSON.stringify(cachedFriends));

  try {
    await setDoc(doc(db, "user_friends", uid), {
      userId: uid,
      friends: cachedFriends,
      incomingRequests: cachedIncomingRequests,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (err) {
    console.error("[Friends] Error accepting request locally:", err);
  }

  // 2. Update sender's document in Firestore: remove me from outgoing, add me to friends
  try {
    const senderDocRef = doc(db, "user_friends", senderId);
    const senderSnap = await getDoc(senderDocRef);
    let senderFriends = [];
    let senderOutgoing = [];
    if (senderSnap.exists()) {
      const data = senderSnap.data();
      senderFriends = data.friends || [];
      senderOutgoing = data.outgoingRequests || [];
    }

    senderOutgoing = senderOutgoing.filter(r => r.toId !== uid && r.id !== uid);
    senderFriends = [{ id: uid, name: myName, addedAt: Date.now() }, ...senderFriends.filter(f => f.id !== uid)];

    await setDoc(senderDocRef, {
      userId: senderId,
      friends: senderFriends,
      outgoingRequests: senderOutgoing,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (err) {
    console.warn("[Friends] Could not update sender doc on accept:", err);
  }

  return { success: true, friend: newFriend };
}

/**
 * Declines an incoming friend request
 */
export async function declineFriendRequest(senderId) {
  const curUser = getCurrentUser();
  const uid = curUser?.id || localStorage.getItem('playerId');
  if (!uid) return;

  cachedIncomingRequests = cachedIncomingRequests.filter(r => r.fromId !== senderId && r.id !== senderId);
  localStorage.setItem(getIncomingKey(uid), JSON.stringify(cachedIncomingRequests));

  try {
    await setDoc(doc(db, "user_friends", uid), {
      userId: uid,
      incomingRequests: cachedIncomingRequests,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (err) {
    console.error("[Friends] Error declining request locally:", err);
  }

  // Also remove from sender's outgoing requests in Firestore
  try {
    const senderDocRef = doc(db, "user_friends", senderId);
    const senderSnap = await getDoc(senderDocRef);
    if (senderSnap.exists()) {
      let senderOutgoing = senderSnap.data().outgoingRequests || [];
      senderOutgoing = senderOutgoing.filter(r => r.toId !== uid && r.id !== uid);
      await setDoc(senderDocRef, {
        outgoingRequests: senderOutgoing,
        updatedAt: serverTimestamp()
      }, { merge: true });
    }
  } catch (err) {
    console.warn("[Friends] Could not update sender doc on decline:", err);
  }

  return { success: true };
}

/**
 * Cancels a pending outgoing request
 */
export async function cancelFriendRequest(targetId) {
  const curUser = getCurrentUser();
  const uid = curUser?.id || localStorage.getItem('playerId');
  if (!uid) return;

  cachedOutgoingRequests = cachedOutgoingRequests.filter(r => r.toId !== targetId && r.id !== targetId);
  localStorage.setItem(getOutgoingKey(uid), JSON.stringify(cachedOutgoingRequests));

  try {
    await setDoc(doc(db, "user_friends", uid), {
      userId: uid,
      outgoingRequests: cachedOutgoingRequests,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (err) {
    console.error("[Friends] Error canceling outgoing request:", err);
  }

  // Also remove from target's incoming in Firestore
  try {
    const targetDocRef = doc(db, "user_friends", targetId);
    const targetSnap = await getDoc(targetDocRef);
    if (targetSnap.exists()) {
      let targetIncoming = targetSnap.data().incomingRequests || [];
      targetIncoming = targetIncoming.filter(r => r.fromId !== uid && r.id !== uid);
      await setDoc(targetDocRef, {
        incomingRequests: targetIncoming,
        updatedAt: serverTimestamp()
      }, { merge: true });
    }
  } catch (err) {
    console.warn("[Friends] Could not remove incoming request from target doc:", err);
  }

  return { success: true };
}

/**
 * Removes a friend by ID
 */
export async function removeFriend(friendId) {
  const curUser = getCurrentUser();
  const uid = curUser?.id || localStorage.getItem('playerId');
  if (!uid) return cachedFriends;

  cachedFriends = cachedFriends.filter(f => f.id !== friendId && f.userId !== friendId);
  localStorage.setItem(getFriendsKey(uid), JSON.stringify(cachedFriends));

  try {
    await setDoc(doc(db, "user_friends", uid), {
      userId: uid,
      friends: cachedFriends,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (err) {
    console.error("[Friends] Firestore remove error:", err);
  }

  // Also remove current user from the other player's list
  try {
    const otherDocRef = doc(db, "user_friends", friendId);
    const otherSnap = await getDoc(otherDocRef);
    if (otherSnap.exists()) {
      let otherFriends = otherSnap.data().friends || [];
      otherFriends = otherFriends.filter(f => f.id !== uid && f.userId !== uid);
      await setDoc(otherDocRef, {
        friends: otherFriends,
        updatedAt: serverTimestamp()
      }, { merge: true });
    }
  } catch (err) {
    console.warn("[Friends] Could not remove mutual friend entry:", err);
  }

  return cachedFriends;
}

/**
 * Legacy compatibility alias for addFriend -> maps to sendFriendRequest
 */
export async function addFriend(friendId, friendName = null) {
  return await sendFriendRequest(friendId, friendName);
}

/**
 * Search player by username or ID in global database
 */
export async function searchPlayerGlobal(queryStr) {
  const clean = (queryStr || '').trim().toLowerCase();
  if (!clean) return [];

  const curUser = getCurrentUser();
  const myUid = curUser?.id || localStorage.getItem('playerId');
  const myName = (curUser?.username || localStorage.getItem('playerName') || '').trim().toLowerCase();

  const results = [];
  try {
    const lbSnap = await getDocs(collection(db, "global_leaderboard"));
    lbSnap.forEach(d => {
      const data = d.data();
      const name = (data.name || '').trim().toLowerCase();
      const id = (d.id || '').trim().toLowerCase();

      // Filter out self
      if (myUid && (id === myUid.toLowerCase() || d.id === myUid)) return;
      if (myName && name === myName) return;

      if (name.includes(clean) || id.includes(clean)) {
        results.push({
          id: d.id,
          name: data.name || 'Player',
          totalScore: data.totalScore || 0,
          levelsCompleted: data.levelsCompleted || 0
        });
      }
    });
  } catch (e) {
    console.warn("[Friends] Search error:", e);
  }

  return results;
}
