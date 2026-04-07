import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, Animated, PanResponder,
  Dimensions, TouchableOpacity, Image, ActivityIndicator,
  Vibration, Platform, InteractionManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { useAnimals, useUser } from '../context/AppContext';
import { COLORS, RADIUS, SHADOW, AGE_COLORS, SPECIES_EMOJI } from '../constants/theme';
import FilterSheet from '../components/FilterSheet';

const { width: W, height: H } = Dimensions.get('window');
const CARD_W = W * 0.9;
const CARD_H = H * 0.63;
const THRESHOLD = W * 0.28;
const DURATION = 160; // faster swipe exit

const haptic = () => {
  if (Platform.OS !== 'web') Vibration.vibrate(30);
};

export default function SwipeScreen() {
  const nav = useNavigation();
  const { animals, loading, error, loadAnimals, hasMore, resetCount, filters } = useAnimals();
  const { likeAnimal, passAnimal, superLikeAnimal, stats } = useUser();
  const [index, setIndex] = useState(0);
  const [showFilter, setShowFilter] = useState(false);
  const [swipeDir, setSwipeDir] = useState(null); // 'like'|'nope'|'super'
  const [showStreak, setShowStreak] = useState(false);

  const pos = useRef(new Animated.ValueXY()).current;
  const rotation = pos.x.interpolate({ inputRange: [-W / 2, 0, W / 2], outputRange: ['-12deg', '0deg', '12deg'], extrapolate: 'clamp' });
  const likeOp = pos.x.interpolate({ inputRange: [0, W / 5], outputRange: [0, 1], extrapolate: 'clamp' });
  const nopeOp = pos.x.interpolate({ inputRange: [-W / 5, 0], outputRange: [1, 0], extrapolate: 'clamp' });
  const superOp = pos.y.interpolate({ inputRange: [-H / 7, 0], outputRange: [1, 0], extrapolate: 'clamp' });
  const backScale = pos.x.interpolate({ inputRange: [-W / 2, 0, W / 2], outputRange: [1, 0.93, 1], extrapolate: 'clamp' });
  const backOp = pos.x.interpolate({ inputRange: [-W / 2, 0, W / 2], outputRange: [1, 0.6, 1], extrapolate: 'clamp' });

  // Refs so PanResponder always calls the latest version (fixes stale closure bug)
  const animalsRef = useRef(animals);
  const indexRef = useRef(index);
  useEffect(() => { animalsRef.current = animals; }, [animals]);
  useEffect(() => { indexRef.current = index; }, [index]);

  // Load on mount. filtersRef is already updated by applyFilters before navigation.
  useEffect(() => { loadAnimals(true); }, []);

  // Reset index to 0 whenever a full reload happens (filter change, zip change, etc.)
  useEffect(() => { setIndex(0); }, [resetCount]);

  // Prefetch next 3 card images so they're ready before the user swipes to them
  useEffect(() => {
    const toPreload = animals.slice(index + 1, index + 4).map((a) => a.primaryPhoto).filter(Boolean);
    toPreload.forEach((uri) => Image.prefetch(uri).catch(() => {}));
  }, [index, animals]);

  useEffect(() => {
    if (animals.length === 0) return; // don't trigger load-more when list was just cleared
    const remaining = animals.length - index;
    if (remaining < 5 && hasMore && !loading) loadAnimals();
  }, [index, animals.length]);

  // Show streak badge every 5 likes
  useEffect(() => {
    if (stats.likeStreak > 0 && stats.likeStreak % 5 === 0) {
      setShowStreak(true);
      setTimeout(() => setShowStreak(false), 2000);
    }
  }, [stats.likeStreak]);

  const swipeTo = useCallback((dir) => {
    const toX = dir === 'right' ? W * 1.6 : dir === 'left' ? -W * 1.6 : 0;
    const toY = dir === 'up' ? -H * 1.5 : 0;
    Animated.timing(pos, { toValue: { x: toX, y: toY }, duration: DURATION, useNativeDriver: false }).start(() => {
      const pet = animalsRef.current[indexRef.current];
      pos.setValue({ x: 0, y: 0 });
      setSwipeDir(null);
      if (dir === 'right') likeAnimal(pet);
      else if (dir === 'left') passAnimal(pet?.id);
      else if (dir === 'up') superLikeAnimal(pet);
      setIndex((i) => i + 1);
    });
  }, [likeAnimal, passAnimal, superLikeAnimal]);

  const resetCard = useCallback(() => {
    Animated.spring(pos, { toValue: { x: 0, y: 0 }, tension: 80, friction: 8, useNativeDriver: false }).start();
    setSwipeDir(null);
  }, []);

  // Use refs for pan callbacks so the PanResponder (created once) always has fresh functions
  const swipeToRef = useRef(swipeTo);
  const resetCardRef = useRef(resetCard);
  useEffect(() => { swipeToRef.current = swipeTo; }, [swipeTo]);
  useEffect(() => { resetCardRef.current = resetCard; }, [resetCard]);

  const panResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => false, // don't steal taps
    onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 5 || Math.abs(g.dy) > 5, // only activate on actual drag
    onPanResponderMove: (_, g) => {
      pos.setValue({ x: g.dx, y: g.dy });
      if (g.dx > 40) setSwipeDir('like');
      else if (g.dx < -40) setSwipeDir('nope');
      else if (g.dy < -40) setSwipeDir('super');
      else setSwipeDir(null);
    },
    onPanResponderRelease: (_, g) => {
      if (g.dx > THRESHOLD) { haptic(); swipeToRef.current('right'); }
      else if (g.dx < -THRESHOLD) { haptic(); swipeToRef.current('left'); }
      else if (g.dy < -THRESHOLD * 0.8) { haptic(); swipeToRef.current('up'); }
      else resetCardRef.current();
    },
    onPanResponderTerminate: () => resetCardRef.current(),
  })).current;

  // ─── Render states ─────────────────────────────────────────
  // Show spinner while loading OR before first load starts (animals empty, no error)
  if ((loading || animals.length === 0) && !error) {
    return (
      <SafeAreaView style={styles.container}>
        <Header onFilter={() => setShowFilter(true)} />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.coral} />
          <Text style={styles.loadingText}>Finding pets near you...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Header onFilter={() => setShowFilter(true)} />
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>😿</Text>
          <Text style={styles.emptyTitle}>Couldn't load pets</Text>
          <Text style={styles.emptySub}>This area may have limited listings. Try a nearby ZIP or wider search.</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => loadAnimals(true)}>
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const outOfCards = index >= animals.length;

  return (
    <SafeAreaView style={styles.container}>
      <Header onFilter={() => setShowFilter(true)} streak={stats.likeStreak} />

      {/* ── Streak Badge ── */}
      {showStreak && (
        <Animated.View style={styles.streakBadge}>
          <Text style={styles.streakText}>🔥 {stats.likeStreak} likes in a row!</Text>
        </Animated.View>
      )}

      {/* ── Card Stack ── */}
      <View style={styles.stack}>
        {outOfCards ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>🐾</Text>
            <Text style={styles.emptyTitle}>You've seen them all!</Text>
            <Text style={styles.emptySub}>Check back later for more pets near you.</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={() => { setIndex(0); loadAnimals(true); }}>
              <Text style={styles.retryText}>Start over</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Back card */}
            {animals[index + 1] && (
              <Animated.View style={[styles.backCard, { transform: [{ scale: backScale }], opacity: backOp }]}>
                <PetCard pet={animals[index + 1]} />
              </Animated.View>
            )}

            {/* Top card */}
            <Animated.View
              style={[styles.topCard, { transform: [{ translateX: pos.x }, { translateY: pos.y }, { rotate: rotation }] }]}
              {...panResponder.panHandlers}
            >
              {/* Swipe overlays */}
              <Animated.View style={[styles.stamp, styles.likeStamp, { opacity: likeOp }]}>
                <Text style={styles.likeStampText}>LIKE</Text>
              </Animated.View>
              <Animated.View style={[styles.stamp, styles.nopeStamp, { opacity: nopeOp }]}>
                <Text style={styles.nopeStampText}>NOPE</Text>
              </Animated.View>
              <Animated.View style={[styles.stamp, styles.superStamp, { opacity: superOp }]}>
                <Text style={styles.superStampText}>SUPER ⭐</Text>
              </Animated.View>

              <PetCard pet={animals[index]} onPress={() => nav.navigate('PetDetail', { animal: animals[index] })} />
            </Animated.View>
          </>
        )}
      </View>

      {/* ── Action Buttons ── */}
      {!outOfCards && (
        <View style={styles.actions}>
          <ActionBtn icon="close" color={COLORS.nopeRed} size={64} onPress={() => { haptic(); swipeToRef.current('left'); }} />
          <ActionBtn icon="star" color={COLORS.superBlue} size={52} onPress={() => { haptic(); swipeToRef.current('up'); }} />
          <ActionBtn icon="heart" color={COLORS.likeGreen} size={64} onPress={() => { haptic(); swipeToRef.current('right'); }} />
        </View>
      )}

      <FilterSheet visible={showFilter} onClose={() => setShowFilter(false)} />
    </SafeAreaView>
  );
}

// ─── Sub-components ────────────────────────────────────────────

function Header({ onFilter, streak }) {
  return (
    <View style={styles.header}>
      <View style={styles.logoRow}>
        <Text style={styles.logoEmoji}>🐾</Text>
        <Text style={styles.logoText}>pupular</Text>
        {streak >= 3 && (
          <View style={styles.streakPill}>
            <Text style={styles.streakPillText}>🔥 {streak}</Text>
          </View>
        )}
      </View>
      <TouchableOpacity style={styles.filterBtn} onPress={onFilter} activeOpacity={0.8}>
        <Ionicons name="options-outline" size={20} color={COLORS.ink} />
      </TouchableOpacity>
    </View>
  );
}

function ActionBtn({ icon, color, size, onPress }) {
  const scale = useRef(new Animated.Value(1)).current;
  const press = () => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 0.88, useNativeDriver: true, speed: 50 }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 50 }),
    ]).start();
    onPress();
  };
  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        style={[styles.actionCircle, { width: size, height: size, borderRadius: size / 2, borderColor: color + '30' }]}
        onPress={press}
        activeOpacity={0.85}
      >
        <Ionicons name={icon} size={size * 0.44} color={color} />
      </TouchableOpacity>
    </Animated.View>
  );
}

function PetCard({ pet, onPress }) {
  if (!pet) return null;
  const ageStyle = AGE_COLORS[pet.ageGroup] || AGE_COLORS.Adult;
  const emoji = SPECIES_EMOJI[pet.species] || SPECIES_EMOJI.default;
  const location = pet.location?.city || pet.org?.city || '';

  return (
    <TouchableOpacity style={styles.card} activeOpacity={onPress ? 0.97 : 1} onPress={onPress}>
      {/* Photo */}
      {pet.primaryPhoto ? (
        <Image source={{ uri: pet.primaryPhoto }} style={styles.cardImg} resizeMode="cover" />
      ) : (
        <View style={[styles.cardImg, styles.noPhoto]}>
          <Text style={{ fontSize: 64 }}>{emoji}</Text>
        </View>
      )}

      {/* Gradient overlay */}
      <View style={styles.cardGrad} />

      {/* Multiple photos indicator */}
      {pet.photos?.length > 1 && (
        <View style={styles.photoDots}>
          {pet.photos.slice(0, Math.min(pet.photos.length, 5)).map((_, i) => (
            <View key={i} style={[styles.photoDot, i === 0 && styles.photoDotActive]} />
          ))}
        </View>
      )}

      {/* Special needs badge */}
      {pet.isSpecialNeeds && (
        <View style={styles.specialBadge}>
          <Text style={styles.specialText}>💛 Special Needs</Text>
        </View>
      )}

      {/* Info overlay */}
      <View style={styles.cardInfo}>
        <View style={styles.nameRow}>
          <Text style={styles.petName} numberOfLines={1}>{pet.name}</Text>
          <View style={[styles.ageBadge, { backgroundColor: ageStyle.bg }]}>
            <Text style={[styles.ageText, { color: ageStyle.text }]}>{pet.ageGroup}</Text>
          </View>
        </View>

        <Text style={styles.breed} numberOfLines={1}>
          {emoji} {pet.breedPrimary}{pet.isMixed ? ' Mix' : ''}
        </Text>

        <View style={styles.metaRow}>
          {location ? (
            <View style={styles.metaChip}>
              <Ionicons name="location-outline" size={12} color="rgba(255,255,255,0.85)" />
              <Text style={styles.metaChipText}>{location}</Text>
            </View>
          ) : null}
          <View style={styles.metaChip}>
            <Ionicons name={pet.sex === 'Male' ? 'male' : 'female'} size={12} color="rgba(255,255,255,0.85)" />
            <Text style={styles.metaChipText}>{pet.sex}</Text>
          </View>
          <View style={styles.metaChip}>
            <Ionicons name="resize-outline" size={12} color="rgba(255,255,255,0.85)" />
            <Text style={styles.metaChipText}>{pet.sizeGroup}</Text>
          </View>
        </View>

        {/* Tap hint */}
        {onPress && (
          <Text style={styles.tapHint}>Tap for more info 👆</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },

  // Header
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 10,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  logoEmoji: { fontSize: 24 },
  logoText: { fontSize: 26, fontWeight: '900', color: COLORS.coral, letterSpacing: -1 },
  streakPill: {
    backgroundColor: '#FFF3E0', borderRadius: RADIUS.pill,
    paddingHorizontal: 10, paddingVertical: 3, marginLeft: 4,
  },
  streakPillText: { fontSize: 12, fontWeight: '700', color: '#E65100' },
  filterBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center',
    ...SHADOW.soft,
  },

  // Stack
  stack: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  topCard: { position: 'absolute', width: CARD_W, height: CARD_H, borderRadius: RADIUS.xl, ...SHADOW.card },
  backCard: { position: 'absolute', width: CARD_W, height: CARD_H, borderRadius: RADIUS.xl, top: 10 },

  // Card
  card: { width: '100%', height: '100%', borderRadius: RADIUS.xl, overflow: 'hidden', backgroundColor: COLORS.charcoal },
  cardImg: { width: '100%', height: '100%', position: 'absolute' },
  noPhoto: { alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surface },
  cardGrad: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: '58%',
    // React Native doesn't support CSS gradients — use expo-linear-gradient in production
    backgroundColor: 'rgba(0,0,0,0)',
  },
  photoDots: {
    position: 'absolute', top: 14, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'center', gap: 4,
  },
  photoDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.4)' },
  photoDotActive: { backgroundColor: COLORS.white, width: 16 },
  specialBadge: {
    position: 'absolute', top: 14, left: 14,
    backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: RADIUS.pill,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  specialText: { color: COLORS.white, fontSize: 11, fontWeight: '700' },

  cardInfo: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 18, paddingBottom: 22,
    backgroundColor: COLORS.overlayCard,
  },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 },
  petName: { fontSize: 28, fontWeight: '900', color: COLORS.white, flex: 1, letterSpacing: -0.5 },
  ageBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS.pill },
  ageText: { fontSize: 11, fontWeight: '800' },
  breed: { fontSize: 14, color: 'rgba(255,255,255,0.8)', fontWeight: '600', marginBottom: 10 },
  metaRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  metaChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: RADIUS.pill,
  },
  metaChipText: { fontSize: 11, color: 'rgba(255,255,255,0.9)', fontWeight: '600' },
  tapHint: { fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 8, textAlign: 'center' },

  // Stamps
  stamp: { position: 'absolute', top: 36, zIndex: 20, paddingHorizontal: 14, paddingVertical: 8, borderRadius: RADIUS.md, borderWidth: 3 },
  likeStamp: { left: 20, borderColor: COLORS.likeGreen, transform: [{ rotate: '-12deg' }] },
  likeStampText: { fontSize: 28, fontWeight: '900', color: COLORS.likeGreen, letterSpacing: 2 },
  nopeStamp: { right: 20, borderColor: COLORS.nopeRed, transform: [{ rotate: '12deg' }] },
  nopeStampText: { fontSize: 28, fontWeight: '900', color: COLORS.nopeRed, letterSpacing: 2 },
  superStamp: { alignSelf: 'center', left: W * 0.28, borderColor: COLORS.superBlue },
  superStampText: { fontSize: 22, fontWeight: '900', color: COLORS.superBlue, letterSpacing: 2 },

  // Actions
  actions: {
    flexDirection: 'row', justifyContent: 'center',
    alignItems: 'center', gap: 18,
    paddingBottom: 12, paddingTop: 6,
  },
  actionCircle: {
    backgroundColor: COLORS.white,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, ...SHADOW.soft,
  },

  // Streak
  streakBadge: {
    position: 'absolute', top: 90, alignSelf: 'center', zIndex: 99,
    backgroundColor: COLORS.ink, borderRadius: RADIUS.pill,
    paddingHorizontal: 20, paddingVertical: 10,
    ...SHADOW.card,
  },
  streakText: { color: COLORS.white, fontWeight: '800', fontSize: 15 },

  // Loading/empty
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 32 },
  loadingText: { color: COLORS.muted, fontSize: 15, fontWeight: '600' },
  emptyCard: {
    width: CARD_W, height: CARD_H, borderRadius: RADIUS.xl,
    backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center',
    gap: 12, padding: 32, ...SHADOW.card,
  },
  emptyEmoji: { fontSize: 56 },
  emptyTitle: { fontSize: 22, fontWeight: '900', color: COLORS.ink, textAlign: 'center' },
  emptySub: { fontSize: 14, color: COLORS.muted, textAlign: 'center', lineHeight: 21 },
  retryBtn: {
    backgroundColor: COLORS.coral, borderRadius: RADIUS.pill,
    paddingHorizontal: 28, paddingVertical: 14,
    marginTop: 8, ...SHADOW.button(COLORS.coral),
  },
  retryText: { color: COLORS.white, fontWeight: '800', fontSize: 15 },
});
