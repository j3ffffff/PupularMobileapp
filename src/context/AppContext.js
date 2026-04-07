import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { searchAnimals } from '../services/rescueGroupsApi';

// ─── Animals Context ───────────────────────────────────────────
const AnimalsContext = createContext(null);

export function AnimalsProvider({ children }) {
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [resetCount, setResetCount] = useState(0); // increments on each full reload
  const DEFAULT_FILTERS = {
    postalcode: '90210',
    miles: 100,
    species: null,
    ageGroup: null,
    sizeGroup: null,
    sex: null,
  };
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  // Keep a ref so loadAnimals always reads the latest filters (avoids stale closure bug)
  const filtersRef = useRef(filters);
  const loadingRef = useRef(false);

  // pageRef so loadAnimals never captures stale page via closure
  const pageRef = useRef(1);

  const loadAnimals = useCallback(async (reset = false) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const currentPage = reset ? 1 : pageRef.current;
      const result = await searchAnimals({ ...filtersRef.current, page: currentPage, limit: 25 });

      if (reset) {
        setAnimals(result.animals);
        pageRef.current = 2;
        setPage(2);
        setResetCount((c) => c + 1);
      } else {
        setAnimals((prev) => {
          const existingIds = new Set(prev.map((a) => a.id));
          const fresh = result.animals.filter((a) => !existingIds.has(a.id));
          return [...prev, ...fresh];
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
    <AnimalsContext.Provider value={{ animals, loading, error, hasMore, filters, resetCount, loadAnimals, applyFilters }}>
      {children}
    </AnimalsContext.Provider>
  );
}
export const useAnimals = () => useContext(AnimalsContext);

// ─── User Context ──────────────────────────────────────────────
const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [liked, setLiked] = useState([]);
  const [passed, setPassed] = useState(new Set());
  const [superLiked, setSuperLiked] = useState([]);
  const [profile, setProfile] = useState({ name: '', postalcode: '90210', onboarded: false });
  const [stats, setStats] = useState({ totalSwiped: 0, likeStreak: 0 });

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

  return (
    <UserContext.Provider value={{
      liked, passed, superLiked, profile, stats,
      likeAnimal, passAnimal, superLikeAnimal, unlikeAnimal, finishOnboarding,
    }}>
      {children}
    </UserContext.Provider>
  );
}
export const useUser = () => useContext(UserContext);
