import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { useUser, useAnimals } from '../context/AppContext';
import { COLORS, RADIUS, SHADOW } from '../constants/theme';

const { width } = Dimensions.get('window');

const SPECIES_OPTIONS = [
  { emoji: '🐶', label: 'Dogs', value: 'dogs' },
  { emoji: '🐱', label: 'Cats', value: 'cats' },
  { emoji: '🐰', label: 'Rabbits', value: 'rabbits' },
  { emoji: '🐾', label: 'All Pets', value: null },
];

// Slides: 0 = Welcome, 1 = ZIP (custom numpad, no keyboard), 2 = Species
export default function OnboardingScreen({ navigation, route }) {
  const { profile, finishOnboarding } = useUser();
  const { applyFilters } = useAnimals();
  const isEditMode = route?.name === 'EditPreferences';

  const [step, setStep] = useState(isEditMode ? 1 : 0);
  const [zip, setZip] = useState(isEditMode ? (profile?.postalcode || '') : '');
  const [species, setSpecies] = useState(null);
  const [locLoading, setLocLoading] = useState(false);
  const slideAnim = useRef(new Animated.Value(isEditMode ? -width : 0)).current;

  const goNext = () => {
    // No keyboard to dismiss — custom numpad never opens system keyboard
    Animated.spring(slideAnim, { toValue: -(step + 1) * width, useNativeDriver: true }).start();
    setStep((s) => s + 1);
  };

  const useMyLocation = async () => {
    setLocLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { setLocLoading(false); return; }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const [geo] = await Location.reverseGeocodeAsync({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      if (geo?.postalCode) setZip(geo.postalCode);
    } catch (e) {
      // silently fail — user can type manually
    } finally {
      setLocLoading(false);
    }
  };

  const tapKey = (key) => {
    if (key === '⌫') setZip((z) => z.slice(0, -1));
    else if (zip.length < 5) setZip((z) => z + key);
  };

  const handleStart = () => {
    const postalcode = zip || '90210';
    applyFilters({ postalcode, species });

    if (isEditMode) {
      navigation.goBack();
      setTimeout(() => finishOnboarding({ name: profile?.name || 'Pet Lover', postalcode }), 50);
    } else {
      finishOnboarding({ name: 'Pet Lover', postalcode });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.overflow}>
        <Animated.View style={[styles.slides, { transform: [{ translateX: slideAnim }] }]}>

          {/* ── Slide 0: Welcome ── */}
          <View style={[styles.slide, { width }]}>
            <View style={styles.heroEmojiStack}>
              <Text style={styles.bgEmoji}>🐕</Text>
              <Text style={styles.bgEmoji2}>🐈</Text>
              <Text style={styles.heroEmoji}>🐾</Text>
            </View>
            <Text style={styles.brand}>pupular</Text>
            <Text style={styles.headline}>Find your{'\n'}forever friend</Text>
            <Text style={styles.sub}>Swipe through thousands of rescue pets near you. Each swipe could save a life.</Text>
            <TouchableOpacity style={styles.btn} onPress={goNext} activeOpacity={0.85}>
              <Text style={styles.btnText}>Let's find a pet 🐶</Text>
            </TouchableOpacity>
            <Text style={styles.micro}>Free forever · Powered by RescueGroups.org</Text>
          </View>

          {/* ── Slide 1: ZIP (custom numpad — no system keyboard ever opens) ── */}
          <View style={[styles.slide, { width }]}>
            <Text style={styles.stepEmoji}>📍</Text>
            <Text style={styles.stepHeadline}>Where are{'\n'}you located?</Text>
            <Text style={styles.stepSub}>We'll show you pets within 100 miles</Text>

            {/* ZIP display */}
            <View style={styles.zipDisplay}>
              <Text style={[styles.zipText, !zip && styles.zipPlaceholder]}>
                {zip || 'Enter ZIP'}
              </Text>
              {zip.length > 0 && (
                <TouchableOpacity onPress={() => setZip('')} style={styles.zipClear}>
                  <Ionicons name="close-circle" size={20} color={COLORS.muted} />
                </TouchableOpacity>
              )}
            </View>

            {/* Use my location */}
            <TouchableOpacity style={styles.locationBtn} onPress={useMyLocation} activeOpacity={0.8} disabled={locLoading}>
              {locLoading
                ? <ActivityIndicator size="small" color={COLORS.coral} />
                : <><Text style={styles.locationBtnIcon}>📍</Text><Text style={styles.locationBtnText}>Use my location</Text></>
              }
            </TouchableOpacity>

            {/* Custom numpad */}
            <View style={styles.numPad}>
              {[['1','2','3'],['4','5','6'],['7','8','9'],['','0','⌫']].map((row, ri) => (
                <View key={ri} style={styles.numRow}>
                  {row.map((key) => (
                    <TouchableOpacity
                      key={key || 'empty'}
                      style={[styles.numKey, key === '' && styles.numKeyHidden]}
                      onPress={() => key !== '' && tapKey(key)}
                      disabled={key === ''}
                      activeOpacity={0.65}
                    >
                      {key === '⌫'
                        ? <Ionicons name="backspace-outline" size={22} color={COLORS.ink} />
                        : <Text style={styles.numKeyText}>{key}</Text>
                      }
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.btn, zip.length > 0 && zip.length < 5 && styles.btnOff]}
              onPress={goNext}
              activeOpacity={0.85}
            >
              <Text style={styles.btnText}>Continue →</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={goNext}>
              <Text style={styles.skip}>Skip</Text>
            </TouchableOpacity>
          </View>

          {/* ── Slide 2: Species ── */}
          <View style={[styles.slide, { width }]}>
            <Text style={styles.stepEmoji}>🐾</Text>
            <Text style={styles.stepHeadline}>What kind{'\n'}of pet?</Text>
            <View style={styles.speciesGrid}>
              {SPECIES_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value || 'all'}
                  style={[styles.speciesCard, species === opt.value && styles.speciesCardActive]}
                  onPress={() => setSpecies(opt.value)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.speciesEmoji}>{opt.emoji}</Text>
                  <Text style={[styles.speciesLabel, species === opt.value && styles.speciesLabelActive]}>
                    {opt.label}
                  </Text>
                  {species === opt.value && (
                    <View style={styles.speciesCheck}>
                      <Text style={{ color: COLORS.white, fontSize: 10 }}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.btn} onPress={handleStart} activeOpacity={0.85}>
              <Text style={styles.btnText}>Start Swiping 🐾</Text>
            </TouchableOpacity>
          </View>

        </Animated.View>
      </View>

      {/* Progress dots */}
      {step > 0 && (
        <View style={styles.dots}>
          {[1, 2].map((i) => (
            <View key={i} style={[styles.dot, step >= i && styles.dotActive]} />
          ))}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  overflow: { flex: 1, overflow: 'hidden' },
  slides: { flexDirection: 'row', flex: 1 },
  slide: { alignItems: 'center', justifyContent: 'center', padding: 32, gap: 14 },
  heroEmojiStack: { position: 'relative', width: 120, height: 120, alignItems: 'center', justifyContent: 'center' },
  bgEmoji: { position: 'absolute', fontSize: 80, opacity: 0.08, top: -10, left: -30, transform: [{ rotate: '-20deg' }] },
  bgEmoji2: { position: 'absolute', fontSize: 70, opacity: 0.08, top: 20, right: -30, transform: [{ rotate: '15deg' }] },
  heroEmoji: { fontSize: 72 },
  brand: { fontSize: 48, fontWeight: '900', color: COLORS.coral, letterSpacing: -2, marginTop: -8 },
  headline: { fontSize: 34, fontWeight: '900', color: COLORS.ink, textAlign: 'center', lineHeight: 42, letterSpacing: -1, marginTop: -4 },
  sub: { fontSize: 15, color: COLORS.muted, textAlign: 'center', lineHeight: 23, maxWidth: 280 },
  stepEmoji: { fontSize: 52 },
  stepHeadline: { fontSize: 28, fontWeight: '900', color: COLORS.ink, textAlign: 'center', lineHeight: 36, letterSpacing: -0.8 },
  stepSub: { fontSize: 14, color: COLORS.muted, textAlign: 'center', marginTop: -8 },
  // ZIP display
  zipDisplay: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    width: '100%', backgroundColor: COLORS.surface, borderRadius: RADIUS.lg,
    paddingHorizontal: 20, paddingVertical: 16, borderWidth: 2, borderColor: 'transparent',
  },
  zipText: { fontSize: 24, fontWeight: '800', color: COLORS.ink, textAlign: 'center', flex: 1 },
  zipPlaceholder: { color: COLORS.muted, fontWeight: '500', fontSize: 16 },
  zipClear: { marginLeft: 8 },
  // Location button
  locationBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: COLORS.coralGlow, borderRadius: RADIUS.pill,
    paddingVertical: 11, paddingHorizontal: 20, width: '100%',
    borderWidth: 1.5, borderColor: COLORS.coral + '40',
  },
  locationBtnIcon: { fontSize: 15 },
  locationBtnText: { fontSize: 14, fontWeight: '700', color: COLORS.coral },
  // Custom numpad
  numPad: { width: '100%', gap: 8 },
  numRow: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  numKey: {
    width: (width - 96) / 3, paddingVertical: 14, backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg, alignItems: 'center', justifyContent: 'center',
  },
  numKeyHidden: { backgroundColor: 'transparent' },
  numKeyText: { fontSize: 22, fontWeight: '600', color: COLORS.ink },
  // Shared
  btn: {
    width: '100%', backgroundColor: COLORS.coral, borderRadius: RADIUS.pill,
    paddingVertical: 17, alignItems: 'center', marginTop: 4,
    ...SHADOW.button(COLORS.coral),
  },
  btnOff: { opacity: 0.35 },
  btnText: { color: COLORS.white, fontSize: 17, fontWeight: '800', letterSpacing: 0.3 },
  skip: { color: COLORS.muted, fontSize: 14, fontWeight: '600', textDecorationLine: 'underline' },
  micro: { color: COLORS.muted, fontSize: 12, textAlign: 'center' },
  speciesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center', width: '100%' },
  speciesCard: {
    width: (width - 88) / 2, backgroundColor: COLORS.surface, borderRadius: RADIUS.xl,
    paddingVertical: 22, alignItems: 'center', gap: 6, borderWidth: 2, borderColor: 'transparent',
  },
  speciesCardActive: { borderColor: COLORS.coral, backgroundColor: COLORS.coralGlow },
  speciesEmoji: { fontSize: 36 },
  speciesLabel: { fontSize: 15, fontWeight: '700', color: COLORS.charcoal },
  speciesLabelActive: { color: COLORS.coral },
  speciesCheck: {
    position: 'absolute', top: 10, right: 10, width: 20, height: 20, borderRadius: 10,
    backgroundColor: COLORS.coral, alignItems: 'center', justifyContent: 'center',
  },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingBottom: 32 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.border },
  dotActive: { width: 22, backgroundColor: COLORS.coral, borderRadius: 3 },
});
