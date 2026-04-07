import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image,
  TouchableOpacity, Dimensions, Linking, Alert, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

import { useUser } from '../context/AppContext';
import { COLORS, RADIUS, SHADOW, AGE_COLORS, SPECIES_EMOJI } from '../constants/theme';

const { width: W } = Dimensions.get('window');

export default function PetDetailScreen() {
  const nav = useNavigation();
  const { params: { animal } } = useRoute();
  const { liked, likeAnimal, unlikeAnimal, superLikeAnimal, superLiked } = useUser();
  const [photoIdx, setPhotoIdx] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;

  const isLiked = liked.some((a) => a.id === animal.id);
  const isSuperLiked = superLiked.some((a) => a.id === animal.id);

  const toggleLike = () => {
    if (isLiked) unlikeAnimal(animal.id);
    else likeAnimal(animal);
  };

  const contactShelter = () => {
    const adoptionUrl = animal.org?.adoptionUrl || animal.url;
    const genericUrl = animal.org?.url;
    const email = animal.org?.email;
    const phone = animal.org?.phone;
    const orgName = animal.org?.name || 'the shelter';

    // Build contact options — prefer direct adoption link or email/phone over generic homepage
    const options = [];
    if (adoptionUrl) options.push({ label: '🌐 View adoption page', action: () => Linking.openURL(adoptionUrl) });
    if (email) options.push({ label: `📧 Email ${orgName}`, action: () => Linking.openURL(`mailto:${email}?subject=Inquiry about ${animal.name}`) });
    if (phone) options.push({ label: `📞 Call ${orgName}`, action: () => Linking.openURL(`tel:${phone}`) });
    if (!adoptionUrl && genericUrl) options.push({ label: '🌐 Visit shelter website', action: () => Linking.openURL(genericUrl) });

    if (options.length === 0) {
      Alert.alert('Contact Shelter', `Please contact ${orgName} directly to inquire about ${animal.name}.`);
      return;
    }
    if (options.length === 1) {
      options[0].action();
      return;
    }
    Alert.alert(
      `Adopt ${animal.name}`,
      `Contact ${orgName}:`,
      [
        ...options.map((o) => ({ text: o.label, onPress: o.action })),
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const ageStyle = AGE_COLORS[animal.ageGroup] || AGE_COLORS.Adult;
  const emoji = SPECIES_EMOJI[animal.species] || SPECIES_EMOJI.default;
  const photos = animal.photos?.length ? animal.photos : [];

  const Trait = ({ icon, label, value, good }) => {
    if (value === null || value === undefined) return null;
    const bg = good === undefined ? COLORS.surface : (value ? '#E8FFF4' : '#FFF1F3');
    const col = good === undefined ? COLORS.muted : (value ? COLORS.likeGreen : COLORS.nopeRed);
    return (
      <View style={[styles.traitCard, { backgroundColor: bg }]}>
        <Text style={styles.traitIcon}>{icon}</Text>
        <Text style={styles.traitLabel}>{label}</Text>
        {good !== undefined && (
          <Ionicons name={value ? 'checkmark-circle' : 'close-circle'} size={16} color={col} style={{ marginLeft: 'auto' }} />
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Close + Like header */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.topBtn} onPress={() => nav.goBack()}>
          <Ionicons name="chevron-down" size={24} color={COLORS.ink} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.topBtn, isLiked && { backgroundColor: COLORS.coralGlow }]} onPress={toggleLike}>
          <Ionicons name={isLiked ? 'heart' : 'heart-outline'} size={22} color={isLiked ? COLORS.coral : COLORS.ink} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} bounces>
        {/* Photo gallery */}
        <View style={styles.gallery}>
          {photos.length > 0 ? (
            <>
              <Animated.ScrollView
                horizontal pagingEnabled showsHorizontalScrollIndicator={false}
                onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
                scrollEventThrottle={16}
                onMomentumScrollEnd={(e) => setPhotoIdx(Math.round(e.nativeEvent.contentOffset.x / W))}
              >
                {photos.map((uri, i) => (
                  <Image key={i} source={{ uri }} style={styles.photo} resizeMode="cover" />
                ))}
              </Animated.ScrollView>
              {photos.length > 1 && (
                <View style={styles.pageDots}>
                  {photos.map((_, i) => (
                    <View key={i} style={[styles.pageDot, i === photoIdx && styles.pageDotActive]} />
                  ))}
                </View>
              )}
            </>
          ) : (
            <View style={[styles.photo, styles.noPhoto]}>
              <Text style={{ fontSize: 80 }}>{emoji}</Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
          {/* Name + age */}
          <View style={styles.nameRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.petName}>{animal.name}</Text>
              <Text style={styles.petBreed}>
                {emoji} {animal.breedPrimary}{animal.isMixed ? ' Mix' : ''} · {animal.species}
              </Text>
            </View>
            <View style={[styles.agePill, { backgroundColor: ageStyle.bg }]}>
              <Text style={[styles.ageText, { color: ageStyle.text }]}>{animal.ageGroup}</Text>
            </View>
          </View>

          {/* Quick stats row */}
          <View style={styles.statsRow}>
            <StatPill icon="male-female-outline" label={animal.sex} />
            <StatPill icon="resize-outline" label={animal.sizeGroup} />
            {(animal.location?.city || animal.org?.city) && (
              <StatPill icon="location-outline" label={animal.location?.city || animal.org?.city} />
            )}
            {animal.ageString && <StatPill icon="calendar-outline" label={animal.ageString} />}
          </View>

          {/* Super like badge */}
          {isSuperLiked && (
            <View style={styles.superBadge}>
              <Text style={styles.superBadgeText}>⭐ You super liked {animal.name}!</Text>
            </View>
          )}

          {/* Description */}
          {!!animal.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About {animal.name}</Text>
              <Text style={styles.description}>{animal.description}</Text>
            </View>
          )}

          {/* Compatibility */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Compatibility</Text>
            <View style={styles.traitsGrid}>
              <Trait icon="👶" label="Good with kids" value={animal.isKidsOk} good />
              <Trait icon="🐶" label="Good with dogs" value={animal.isDogsOk} good />
              <Trait icon="🐱" label="Good with cats" value={animal.isCatsOk} good />
              <Trait icon="🏠" label="House trained" value={animal.isHousetrained} good />
            </View>
          </View>

          {/* Health */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Health & Care</Text>
            <View style={styles.traitsGrid}>
              <Trait icon="💉" label="Vaccinated" value={animal.isCurrentVaccinations} good />
              <Trait icon="✂️" label="Spayed/Neutered" value={animal.isAltered} good />
              <Trait icon="📡" label="Microchipped" value={animal.isMicrochipped} good />
              {animal.coatLength && <Trait icon="🪮" label={`${animal.coatLength} coat`} />}
            </View>
          </View>

          {/* Personality */}
          {(animal.energyLevel || animal.activityLevel) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Personality</Text>
              <View style={styles.traitsGrid}>
                {animal.energyLevel && <Trait icon="⚡" label={`Energy: ${animal.energyLevel}`} />}
                {animal.activityLevel && <Trait icon="🏃" label={`Activity: ${animal.activityLevel}`} />}
              </View>
            </View>
          )}

          {/* Shelter info */}
          {animal.org && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Rescue / Shelter</Text>
              <View style={styles.orgCard}>
                <View style={styles.orgIcon}>
                  <Text style={{ fontSize: 22 }}>🏠</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.orgName}>{animal.org.name}</Text>
                  {(animal.org.city || animal.org.state) && (
                    <Text style={styles.orgLocation}>
                      {[animal.org.city, animal.org.state].filter(Boolean).join(', ')}
                    </Text>
                  )}
                </View>
                {animal.org.phone && (
                  <TouchableOpacity onPress={() => Linking.openURL(`tel:${animal.org.phone}`)}>
                    <Ionicons name="call" size={20} color={COLORS.coral} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* CTA */}
      <View style={styles.cta}>
        <TouchableOpacity style={styles.ctaBtn} onPress={contactShelter} activeOpacity={0.88}>
          <Text style={styles.ctaBtnText}>Inquire About {animal.name} 🐾</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function StatPill({ icon, label }) {
  return (
    <View style={styles.statPill}>
      <Ionicons name={icon} size={13} color={COLORS.coral} />
      <Text style={styles.statPillText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  topBar: {
    position: 'absolute', top: 52, left: 0, right: 0, zIndex: 10,
    flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16,
  },
  topBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center', justifyContent: 'center', ...SHADOW.soft,
  },
  // Gallery
  gallery: { width: W, height: W * 1.05 },
  photo: { width: W, height: W * 1.05 },
  noPhoto: { backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center' },
  pageDots: {
    position: 'absolute', bottom: 14, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'center', gap: 5,
  },
  pageDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.4)' },
  pageDotActive: { width: 18, backgroundColor: COLORS.white },
  // Content
  content: { padding: 20 },
  nameRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 12 },
  petName: { fontSize: 32, fontWeight: '900', color: COLORS.ink, letterSpacing: -1 },
  petBreed: { fontSize: 15, color: COLORS.muted, fontWeight: '600', marginTop: 3 },
  agePill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: RADIUS.pill, marginTop: 6 },
  ageText: { fontSize: 12, fontWeight: '800' },
  // Stats
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  statPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: COLORS.coralGlow, paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: RADIUS.pill,
  },
  statPillText: { fontSize: 12, fontWeight: '700', color: COLORS.coral },
  // Super badge
  superBadge: {
    backgroundColor: '#EEF4FF', borderRadius: RADIUS.lg, padding: 12,
    marginBottom: 16, alignItems: 'center',
  },
  superBadgeText: { color: COLORS.superBlue, fontWeight: '700', fontSize: 14 },
  // Sections
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: COLORS.ink, marginBottom: 10 },
  description: { fontSize: 14, color: COLORS.muted, lineHeight: 22 },
  // Traits
  traitsGrid: { gap: 8 },
  traitCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderRadius: RADIUS.md, padding: 12,
  },
  traitIcon: { fontSize: 18 },
  traitLabel: { fontSize: 14, fontWeight: '600', color: COLORS.ink, flex: 1 },
  // Org
  orgCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: 14,
  },
  orgIcon: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: COLORS.coralGlow, alignItems: 'center', justifyContent: 'center',
  },
  orgName: { fontSize: 15, fontWeight: '700', color: COLORS.ink },
  orgLocation: { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  // CTA
  cta: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 16, paddingBottom: 32, backgroundColor: COLORS.white,
    borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  ctaBtn: {
    backgroundColor: COLORS.coral, borderRadius: RADIUS.pill,
    paddingVertical: 17, alignItems: 'center',
    ...SHADOW.button(COLORS.coral),
  },
  ctaBtnText: { color: COLORS.white, fontSize: 17, fontWeight: '800' },
});
