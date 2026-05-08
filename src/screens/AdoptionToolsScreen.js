import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, RADIUS, SHADOW } from '../constants/theme';
import { sharePupularApp } from '../utils/shareApp';

export default function AdoptionToolsScreen() {
  const navigation = useNavigation();

  const handleInviteFriend = () => sharePupularApp();

  const openInsurance = () => navigation.navigate('PetInsuranceGuide');

  const ToolCard = ({ icon, title, subtitle, color, onPress }) => (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={[styles.iconWrap, { backgroundColor: `${color}18` }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={COLORS.muted} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Ionicons name="chevron-back" size={22} color={COLORS.ink} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Adoption Tools</Text>
          <Text style={styles.subtitle}>Helpful next steps for new adopters</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>🐾</Text>
          <Text style={styles.heroTitle}>Everything you need after the match</Text>
          <Text style={styles.heroText}>
            Use these tools to get ready, share Pupular with friends, and make the adoption journey smoother.
          </Text>
        </View>

        <Text style={styles.sectionLabel}>GROWTH</Text>
        <ToolCard
          icon="share-social-outline"
          title="Invite a Friend"
          subtitle="Help more pets get seen by sharing Pupular"
          color={COLORS.sky}
          onPress={handleInviteFriend}
        />

        <Text style={styles.sectionLabel}>NEW ADOPTER PREP</Text>
        <ToolCard
          icon="checkmark-done-outline"
          title="New Pet Checklist"
          subtitle="Prep your home before you adopt"
          color={COLORS.likeGreen}
          onPress={() => navigation.navigate('NewPetChecklist')}
        />
        <ToolCard
          icon="shield-checkmark-outline"
          title="Pet Insurance Guide"
          subtitle="Compare useful coverage options"
          color={COLORS.amber}
          onPress={openInsurance}
        />
        <ToolCard
          icon="globe-outline"
          title="RescueGroups.org"
          subtitle="Learn more about the adoption data network powering Pupular"
          color={COLORS.sky}
          onPress={() => Linking.openURL('https://rescuegroups.org')}
        />

        <View style={styles.noteCard}>
          <Text style={styles.noteTitle}>Value-add rule</Text>
          <Text style={styles.noteText}>
            Pupular should only recommend offers and resources that are genuinely helpful for adopters. No junk promos.
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
  heroEmoji: { fontSize: 34, marginBottom: 10 },
  heroTitle: { fontSize: 20, fontWeight: '900', color: COLORS.ink, marginBottom: 8 },
  heroText: { fontSize: 14, lineHeight: 22, color: COLORS.muted },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: COLORS.muted, letterSpacing: 1.2, marginTop: 10, marginBottom: 8, marginHorizontal: 4 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: COLORS.white, borderRadius: RADIUS.xl, padding: 16, marginBottom: 10, ...SHADOW.soft },
  iconWrap: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 15, fontWeight: '800', color: COLORS.ink },
  cardSubtitle: { fontSize: 13, lineHeight: 19, color: COLORS.muted, marginTop: 3 },
  noteCard: { backgroundColor: '#FFF8F0', borderRadius: RADIUS.xl, padding: 16, marginTop: 16, borderWidth: 1, borderColor: '#FFCC80' },
  noteTitle: { fontSize: 14, fontWeight: '800', color: '#E65100', marginBottom: 6 },
  noteText: { fontSize: 13, lineHeight: 20, color: '#BF6000' },
});
