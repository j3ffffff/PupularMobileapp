import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { searchAnimals } from '../services/rescueGroupsApi';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase';
import { signInWithApple, signUpWithEmail, signInWithEmail, signOut } from '../services/auth';
import { loadCloudData, saveCloudData, mergeWithCloud } from '../services/cloudSync';

function prioritizePhotoRichAnimals(items = []) {
  return [...items].sort((a, b) => {
    const aHasPhoto = Boolean(a?.primaryPhoto || (a?.photos && a.photos.length > 0));
    const bHasPhoto = Boolean(b?.primaryPhoto || (b?.photos && b.photos.length > 0));
    if (aHasPhoto === bHasPhoto) return 0;
    return aHasPhoto ? -1 : 1;
  });
}

const STORAGE_KEYS = {
  filters: 'pupular.filters.v1',
  profile: 'pupular.profile.v1',
  liked: 'pupular.liked.v1',
  superLiked: 'pupular.superliked.v1',
  stats: 'pupular.stats.v1',
};

// ─── Animals Context ───────────────────────────────────────────
const AnimalsContext = createContext(null);

export function AnimalsProvider({ children }) {
  const DEFAULT_FILTERS = {
    postalcode: '90210',
    miles: 100,
    species: null,
    ageGroup: null,
    sizeGroup: null,
    sex: null,
  };

  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [resetCount, setResetCount] = useState(0); // increments on each full reload
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [filtersReady, setFiltersReady] = useState(false);
  // Keep a ref so loadAnimals always reads the latest filters (avoids stale closure bug)
  const filtersRef = useRef(filters);
  const loadingRef = useRef(false);

  // pageRef so loadAnimals never captures stale page via closure
  const pageRef = useRef(1);

  useEffect(() => {
    let cancelled = false;

    const hydrateFilters = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEYS.filters);
        if (saved && !cancelled) {
          const parsed = JSON.parse(saved);
          const nextFilters = { ...DEFAULT_FILTERS, ...parsed };
          setFilters(nextFilters);
          filtersRef.current = nextFilters;
        }
      } catch (error) {
        console.warn('Failed to restore filters', error);
      } finally {
        if (!cancelled) setFiltersReady(true);
      }
    };

    hydrateFilters();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!filtersReady) return;

    AsyncStorage.setItem(STORAGE_KEYS.filters, JSON.stringify(filters)).catch((error) => {
      console.warn('Failed to save filters', error);
    });
  }, [filters, filtersReady]);

  const loadAnimals = useCallback(async (reset = false) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const currentPage = reset ? 1 : pageRef.current;
      const result = await searchAnimals({ ...filtersRef.current, page: currentPage, limit: 25 });

      if (reset) {
        setAnimals(prioritizePhotoRichAnimals(result.animals));
        pageRef.current = 2;
        setPage(2);
        setResetCount((c) => c + 1);
      } else {
        setAnimals((prev) => {
          const existingIds = new Set(prev.map((a) => a.id));
          const fresh = result.animals.filter((a) => !existingIds.has(a.id));
          return [...prev, ...prioritizePhotoRichAnimals(fresh)];
        });
        pageRef.current = pageRef.current + 1;
        setPage((p) => p + 1);
      }
      setHasMore(currentPage < result.pages);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, []); // no deps — uses refs for page + filters, never goes stale

  const applyFilters = useCallback((newFilters) => {
    setFilters((prev) => {
      const updated = { ...prev, ...newFilters };
      filtersRef.current = updated; // sync immediately so loadAnimals sees new zip
      return updated;
    });
    pageRef.current = 1; // reset page ref synchronously
    setPage(1);
    setAnimals([]);
    setHasMore(true);
    loadingRef.current = false; // unblock any in-flight guard
  }, []);

  return (
    <AnimalsContext.Provider value={{ animals, loading, error, hasMore, filters, filtersReady, resetCount, loadAnimals, applyFilters }}>
      {children}
    </AnimalsContext.Provider>
  );
}
export const useAnimals = () => useContext(AnimalsContext);

// ─── User Context ──────────────────────────────────────────────
const UserContext = createContext(null);

export function UserProvider({ children }) {
  const DEFAULT_PROFILE = { name: '', postalcode: '90210', onboarded: false };

  const [liked, setLiked] = useState([]);
  const [passed, setPassed] = useState(new Set());
  const [superLiked, setSuperLiked] = useState([]);
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [profileReady, setProfileReady] = useState(false);
  const [stats, setStats] = useState({ totalSwiped: 0, likeStreak: 0 });
  const [authUser, setAuthUser] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const authReady = !!auth;
  const cloudLoadedRef = useRef(false);
  const saveTimerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    const hydrate = async () => {
      try {
        const [savedProfile, savedLiked, savedSuperLiked, savedStats] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.profile),
          AsyncStorage.getItem(STORAGE_KEYS.liked),
          AsyncStorage.getItem(STORAGE_KEYS.superLiked),
          AsyncStorage.getItem(STORAGE_KEYS.stats),
        ]);
        if (cancelled) return;
        if (savedProfile) setProfile({ ...DEFAULT_PROFILE, ...JSON.parse(savedProfile) });
        if (savedLiked) setLiked(JSON.parse(savedLiked));
        if (savedSuperLiked) setSuperLiked(JSON.parse(savedSuperLiked));
        if (savedStats) setStats((prev) => ({ ...prev, ...JSON.parse(savedStats) }));
      } catch (error) {
        console.warn('Failed to restore user data', error);
      } finally {
        if (!cancelled) setProfileReady(true);
      }
    };

    hydrate();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!profileReady) return;

    Promise.all([
      AsyncStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(profile)),
      AsyncStorage.setItem(STORAGE_KEYS.liked, JSON.stringify(liked)),
      AsyncStorage.setItem(STORAGE_KEYS.superLiked, JSON.stringify(superLiked)),
      AsyncStorage.setItem(STORAGE_KEYS.stats, JSON.stringify(stats)),
    ]).catch((error) => {
      console.warn('Failed to save user data', error);
    });
  }, [profile, liked, superLiked, stats, profileReady]);

  // Listen to Firebase auth state
  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
      if (!user) cloudLoadedRef.current = false;
    });
    return unsubscribe;
  }, []);

  // Load and merge cloud data when signed in
  useEffect(() => {
    if (!authUser || !profileReady || cloudLoadedRef.current) return;

    const loadCloud = async () => {
      setSyncing(true);
      try {
        const cloudData = await loadCloudData(authUser.uid);
        const localData = { liked, superLiked, profile, stats };
        const merged = mergeWithCloud(cloudData, localData);
        setLiked(merged.liked);
        setSuperLiked(merged.superLiked);
        setProfile(merged.profile);
        setStats(merged.stats);
        cloudLoadedRef.current = true;
      } catch (e) {
        console.warn('Cloud sync failed:', e);
        cloudLoadedRef.current = true;
      } finally {
        setSyncing(false);
      }
    };

    loadCloud();
  }, [authUser, profileReady]);

  // Save to cloud when data changes (debounced 2s)
  useEffect(() => {
    if (!authUser || !profileReady || !cloudLoadedRef.current) return;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveCloudData(authUser.uid, { liked, superLiked, profile, stats });
    }, 2000);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [liked, superLiked, profile, stats, authUser, profileReady]);

  const likeAnimal = useCallback((animal) => {
    setLiked((p) => [animal, ...p]);
    setStats((s) => ({
      totalSwiped: s.totalSwiped + 1,
      likeStreak: s.likeStreak + 1,
    }));
  }, []);

  const passAnimal = useCallback((id) => {
    setPassed((p) => new Set([...p, id]));
    setStats((s) => ({ ...s, totalSwiped: s.totalSwiped + 1, likeStreak: 0 }));
  }, []);

  const superLikeAnimal = useCallback((animal) => {
    setSuperLiked((p) => [animal, ...p]);
    setLiked((p) => [animal, ...p]);
    setStats((s) => ({ totalSwiped: s.totalSwiped + 1, likeStreak: s.likeStreak + 1 }));
  }, []);

  const unlikeAnimal = useCallback((id) => {
    setLiked((p) => p.filter((a) => a.id !== id));
    setSuperLiked((p) => p.filter((a) => a.id !== id));
  }, []);

  const finishOnboarding = useCallback((data) => {
    setProfile({ ...data, onboarded: true });
  }, []);

  const handleSignIn = useCallback(async () => {
    const { user, displayName } = await signInWithApple();
    if (displayName && !profile.name) {
      setProfile((prev) => ({ ...prev, name: displayName }));
    }
    return user;
  }, [profile.name]);

  const handleEmailSignUp = useCallback(async (email, password, name) => {
    const { user, displayName } = await signUpWithEmail(email, password, name);
    if (displayName && !profile.name) {
      setProfile((prev) => ({ ...prev, name: displayName }));
    }
    return user;
  }, [profile.name]);

  const handleEmailSignIn = useCallback(async (email, password) => {
    const { user, displayName } = await signInWithEmail(email, password);
    if (displayName && !profile.name) {
      setProfile((prev) => ({ ...prev, name: displayName }));
    }
    return user;
  }, [profile.name]);

  const handleSignOut = useCallback(async () => {
    await signOut();
    cloudLoadedRef.current = false;
  }, []);

  return (
    <UserContext.Provider value={{
      liked, passed, superLiked, profile, profileReady, stats,
      authUser, syncing, authReady,
      likeAnimal, passAnimal, superLikeAnimal, unlikeAnimal, finishOnboarding,
      handleSignIn, handleEmailSignUp, handleEmailSignIn, handleSignOut,
    }}>
      {children}
    </UserContext.Provider>
  );
}
export const useUser = () => useContext(UserContext);
