import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, RADIUS, SHADOW } from '../constants/theme';

const GUIDE_SECTIONS = [
  {
    title: 'When insurance can help',
    color: COLORS.amber,
    icon: 'shield-checkmark-outline',
    items: [
      'Unexpected ER visits or surgeries can get expensive fast.',
      'Some plans help with accidents, illness, diagnostics, and meds.',
      'It is most useful when you want predictable downside protection, not routine savings.',
    ],
  },
  {
    title: 'What to compare',
    color: COLORS.sky,
    icon: 'options-outline',
    items: [
      'Deductible, reimbursement rate, annual payout cap, and waiting periods.',
      'Breed exclusions, dental coverage, exam-fee policy, and pre-existing condition rules.',
      'Whether the claim flow is simple enough that you would actually use it.',
    ],
  },
  {
    title: 'Before you buy',
    color: COLORS.likeGreen,
    icon: 'checkmark-done-outline',
    items: [
      'Ask your vet what issues are common for your pet’s breed and age.',
      'Check whether a starter emergency fund might cover your realistic worst case instead.',
      'Read one real sample policy, not just the marketing bullets.',
    ],
  },
];

const PARTNER_URL = 'https://www.chewy.com/compare-pet-insurance?utm_source=pupular';

export default function PetInsuranceGuideScreen() {
  const navigation = useNavigation();

  const openPartner = () => {
    Alert.alert(
      'Open insurance comparison',
      'This opens an external comparison page. Pupular may earn a referral commission at no extra cost to you.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open', onPress: () => Linking.openURL(PARTNER_URL) },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Ionicons name="chevron-back" size={22} color={COLORS.ink} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Pet Insurance Guide</Text>
          <Text style={styles.subtitle}>Practical advice first, external links second</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>🛟🐾</Text>
          <Text style={styles.heroTitle}>Stay in Pupular while you decide</Text>
          <Text style={styles.heroText}>
            We moved this guide in-app so you can compare the basics without getting kicked into the old web experience. If you choose to open a partner page, you will do it intentionally.
          </Text>
        </View>

        {GUIDE_SECTIONS.map((section) => (
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
          <Text style={styles.noteTitle}>Disclosure</Text>
          <Text style={styles.noteText}>
            Pupular should only recommend genuinely useful resources. If we link to a partner comparison page, it should be because it helps adopters make a better decision — not because it is promotional filler.
          </Text>
        </View>

        <TouchableOpacity style={styles.partnerBtn} onPress={openPartner} activeOpacity={0.85}>
          <Ionicons name="open-outline" size={18} color={COLORS.white} />
          <Text style={styles.partnerBtnText}>Open external comparison</Text>
        </TouchableOpacity>
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
  scrollContent: { padding: 20, paddingTop: 8, paddingBottom: 36 },
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
  partnerBtn: { marginTop: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.amber, borderRadius: RADIUS.pill, paddingVertical: 16, ...SHADOW.button(COLORS.amber) },
  partnerBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '800' },
});
