import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

export async function loadCloudData(uid) {
  if (!db) return null;
  try {
    const snapshot = await getDoc(doc(db, 'users', uid));
    return snapshot.exists() ? snapshot.data() : null;
  } catch (e) {
    console.warn('Failed to load cloud data:', e.message);
    return null;
  }
}

export async function saveCloudData(uid, data) {
  if (!db) return;
  try {
    await setDoc(doc(db, 'users', uid), data, { merge: true });
  } catch (e) {
    console.warn('Failed to save cloud data:', e.message);
  }
}

export function mergeWithCloud(cloudData, localData) {
  if (!cloudData) return localData;

  // Union liked animals by ID (keeps both local + cloud)
  const likedMap = new Map();
  [...(cloudData.liked || []), ...(localData.liked || [])].forEach((a) => likedMap.set(a.id, a));

  const superLikedMap = new Map();
  [...(cloudData.superLiked || []), ...(localData.superLiked || [])].forEach((a) => superLikedMap.set(a.id, a));

  return {
    liked: Array.from(likedMap.values()),
    superLiked: Array.from(superLikedMap.values()),
    profile: {
      ...(cloudData.profile || {}),
      ...(localData.profile || {}),
    },
    stats: {
      totalSwiped: Math.max(
        cloudData.stats?.totalSwiped || 0,
        localData.stats?.totalSwiped || 0
      ),
      likeStreak: localData.stats?.likeStreak || 0,
    },
  };
}
