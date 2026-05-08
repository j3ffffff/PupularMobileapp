import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, RADIUS, SHADOW } from '../constants/theme';

export default function PrivacyPolicyScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={22} color={COLORS.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <Text style={styles.heroEmoji}>🔒</Text>
          <Text style={styles.heroTitle}>Your privacy matters</Text>
          <Text style={styles.heroBody}>
            Pupular only uses your information to help you find adoptable pets and keep your app experience working.
          </Text>
        </View>

        <PolicySection title="Information we use">
          We may store your preferences, liked pets, account email, approximate location or ZIP/postal code, and adoption browsing activity inside Pupular.
        </PolicySection>

        <PolicySection title="How we use it">
          We use this information to show nearby adoptable pets, save your favorites, sync your profile when you sign in, and improve the Pupular experience.
        </PolicySection>

        <PolicySection title="Pet data">
          Adoptable pet profiles are provided by rescue and shelter data partners, including RescueGroups.org. Shelter contact links may open third-party websites or apps.
        </PolicySection>

        <PolicySection title="We do not sell personal data">
          Pupular does not sell your personal information. If this changes, we will update this policy and give users clear notice.
        </PolicySection>

        <PolicySection title="Contact">
          Questions about privacy? Contact us at hello@pupular.app.
        </PolicySection>

        <Text style={styles.footer}>Last updated: May 2026</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function PolicySection({ title, children }) {
  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.bodyText}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.soft,
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: COLORS.ink },
  headerSpacer: { width: 40 },
  content: { padding: 20, paddingBottom: 32, gap: 16 },
  heroCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: 22,
    alignItems: 'center',
    ...SHADOW.soft,
  },
  heroEmoji: { fontSize: 42, marginBottom: 8 },
  heroTitle: { fontSize: 24, fontWeight: '900', color: COLORS.ink, textAlign: 'center' },
  heroBody: { marginTop: 8, fontSize: 15, lineHeight: 22, color: COLORS.muted, textAlign: 'center' },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: 18,
    ...SHADOW.soft,
  },
  sectionTitle: { fontSize: 16, fontWeight: '900', color: COLORS.ink, marginBottom: 8 },
  bodyText: { fontSize: 14, lineHeight: 21, color: COLORS.muted },
  footer: { textAlign: 'center', color: COLORS.muted, fontSize: 12, marginTop: 8 },
});
