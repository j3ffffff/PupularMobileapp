import React from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, RADIUS, SHADOW } from '../constants/theme';

async function openExternalUrl(url, label) {
  try {
    const supported = await Linking.canOpenURL(url);
    if (!supported) {
      Alert.alert('Unable to Open', `${label} is not available on this device right now.`);
      return;
    }
    await Linking.openURL(url);
  } catch (error) {
    Alert.alert('Unable to Open', `Could not open ${label}. Please try again.`);
  }
}

export default function AboutPupularScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={22} color={COLORS.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About Pupular</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <Text style={styles.heroEmoji}>🐾</Text>
          <Text style={styles.heroTitle}>Find your forever friend</Text>
          <Text style={styles.heroBody}>
            Pupular helps you discover rescue pets nearby in a fast, warm, swipeable experience.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>What Pupular does</Text>
          <Text style={styles.bodyText}>
            Swipe through thousands of rescue animals near you — dogs, cats, rabbits, and more.
            Each swipe could save a life.
          </Text>
          <Text style={styles.bodyText}>
            Pupular is free forever and powered by RescueGroups.org data.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Links</Text>

          <TouchableOpacity style={styles.linkRow} onPress={() => navigation.navigate('PrivacyPolicy')}>
            <Ionicons name="document-text-outline" size={18} color={COLORS.sky} />
            <Text style={styles.linkText}>Privacy Policy</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.linkRow, styles.lastRow]} onPress={() => openExternalUrl('https://rescuegroups.org', 'RescueGroups.org')}>
            <Ionicons name="heart-outline" size={18} color={COLORS.likeGreen} />
            <Text style={styles.linkText}>Powered by RescueGroups.org</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
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
    padding: 24,
    alignItems: 'center',
    ...SHADOW.soft,
  },
  heroEmoji: { fontSize: 38, marginBottom: 8 },
  heroTitle: { fontSize: 24, fontWeight: '900', color: COLORS.ink, textAlign: 'center' },
  heroBody: { fontSize: 15, lineHeight: 22, color: COLORS.muted, textAlign: 'center', marginTop: 10 },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: 20,
    ...SHADOW.soft,
  },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: COLORS.ink, marginBottom: 10 },
  bodyText: { fontSize: 15, lineHeight: 22, color: COLORS.ink, marginBottom: 10 },
  linkRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  lastRow: { borderBottomWidth: 0 },
  linkText: { fontSize: 15, fontWeight: '600', color: COLORS.ink },
});
