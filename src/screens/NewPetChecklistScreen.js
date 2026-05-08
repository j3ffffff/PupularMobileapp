import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, RADIUS, SHADOW } from '../constants/theme';

const CHECKLIST_SECTIONS = [
  {
    title: 'Before you bring them home',
    color: COLORS.likeGreen,
    icon: 'home-outline',
    items: [
      'Pick a quiet first-day space with a bed or crate.',
      'Pet-proof cords, trash cans, houseplants, meds, and loose food.',
      'Confirm food, meds, and routines with the rescue or shelter.',
      'Save the rescue contact info and your nearest emergency vet.',
    ],
  },
  {
    title: 'Must-have supplies',
    color: COLORS.sky,
    icon: 'bag-handle-outline',
    items: [
      'Food + water bowls and the current food they already tolerate.',
      'Collar, harness, leash, ID tag, and a safe carrier if needed.',
      'Waste bags, litter + box, enzymatic cleaner, and grooming basics.',
      'A few toys, treats, and one comfy resting spot they can claim.',
    ],
  },
  {
    title: 'First 48 hours',
    color: COLORS.amber,
    icon: 'sunny-outline',
    items: [
      'Keep things calm and avoid overwhelming intros or crowded outings.',
      'Offer water, short potty breaks, and gentle decompression time.',
      'Watch appetite, bathroom habits, and stress signals closely.',
      'Go slow with resident pets and keep first meetings structured.',
    ],
  },
  {
    title: 'Week one',
    color: COLORS.coral,
    icon: 'calendar-outline',
    items: [
      'Book the first vet check and transfer microchip details if needed.',
      'Start a simple routine for feeding, potty breaks, sleep, and walks.',
      'Reward calm behavior and begin name recognition + easy cues.',
      'Give them time — bonding often takes days or weeks, not hours.',
    ],
  },
];

export default function NewPetChecklistScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Ionicons name="chevron-back" size={22} color={COLORS.ink} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>New Pet Checklist</Text>
          <Text style={styles.subtitle}>A calm, practical prep list for adoption day</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>✅🐾</Text>
          <Text style={styles.heroTitle}>Stay in Pupular, skip the old web flow</Text>
          <Text style={styles.heroText}>
            This checklist now lives inside the app so you can prep for adoption without getting bounced into the legacy web experience.
          </Text>
        </View>

        {CHECKLIST_SECTIONS.map((section) => (
          <View key={section.title} style={styles.sectionWrap}>
            <View style={styles.sectionHeader}>
              <View style={[styles.iconWrap, { backgroundColor: `${section.color}18` }]}>
                <Ionicons name={section.icon} size={20} color={section.color} />
              </View>
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>

            <View style={styles.card}>
              {section.items.map((item, index) => (
                <View key={`${section.title}-${index}`} style={styles.row}>
                  <View style={[styles.checkDot, { backgroundColor: section.color }]} />
                  <Text style={styles.rowText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}

        <View style={styles.noteCard}>
          <Text style={styles.noteTitle}>Quick reminder</Text>
          <Text style={styles.noteText}>
            Every rescue pet adjusts on a different timeline. Quiet consistency beats trying to do everything on day one.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  backBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center', ...SHADOW.soft },
  title: { fontSize: 24, fontWeight: '900', color: COLORS.ink, letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: COLORS.muted, marginTop: 2 },
  scrollContent: { padding: 20, paddingTop: 8, paddingBottom: 40 },
  hero: { backgroundColor: COLORS.white, borderRadius: RADIUS.xl, padding: 22, marginBottom: 20, ...SHADOW.soft },
  heroEmoji: { fontSize: 32, marginBottom: 10 },
  heroTitle: { fontSize: 20, fontWeight: '900', color: COLORS.ink, marginBottom: 8 },
  heroText: { fontSize: 14, lineHeight: 22, color: COLORS.muted },
  sectionWrap: { marginBottom: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8, paddingHorizontal: 4 },
  iconWrap: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: COLORS.ink, flex: 1 },
  card: { backgroundColor: COLORS.white, borderRadius: RADIUS.xl, padding: 16, ...SHADOW.soft },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 8 },
  checkDot: { width: 10, height: 10, borderRadius: 99, marginTop: 7, flexShrink: 0 },
  rowText: { flex: 1, fontSize: 14, lineHeight: 22, color: COLORS.ink },
  noteCard: { backgroundColor: '#FFF8F0', borderRadius: RADIUS.xl, padding: 16, borderWidth: 1, borderColor: '#FFCC80', marginTop: 4 },
  noteTitle: { fontSize: 14, fontWeight: '800', color: '#E65100', marginBottom: 6 },
  noteText: { fontSize: 13, lineHeight: 20, color: '#BF6000' },
});
