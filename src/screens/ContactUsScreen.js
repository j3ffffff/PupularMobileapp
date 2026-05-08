import React from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, RADIUS, SHADOW } from '../constants/theme';

const EMAIL_URL = 'mailto:hello@pupular.app';
const EMAIL_ADDRESS = 'hello@pupular.app';

async function copyEmailAddress(showSuccessAlert = true) {
  await Clipboard.setStringAsync(EMAIL_ADDRESS);
  if (showSuccessAlert) {
    Alert.alert('Copied', `${EMAIL_ADDRESS} copied to clipboard.`);
  }
}

async function openEmail() {
  try {
    const supported = await Linking.canOpenURL(EMAIL_URL);
    if (supported) {
      await Linking.openURL(EMAIL_URL);
      return;
    }
  } catch (error) {
    // Fall through to the fallback alert below.
  }

  await copyEmailAddress(false);
  Alert.alert(
    'Mail Unavailable',
    `Mail could not open here, so ${EMAIL_ADDRESS} was copied to your clipboard.`,
    [{ text: 'OK', style: 'cancel' }]
  );
}

export default function ContactUsScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={22} color={COLORS.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contact Us</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <Text style={styles.heroEmoji}>💌</Text>
          <Text style={styles.heroTitle}>We’d love to hear from you</Text>
          <Text style={styles.heroBody}>
            Questions, feedback, bugs, or ideas — send them our way and we’ll help.
          </Text>
        </View>

        <View style={styles.card}>
          <TouchableOpacity style={styles.primaryButton} onPress={openEmail}>
            <Ionicons name="mail-outline" size={18} color={COLORS.white} />
            <Text style={styles.primaryButtonText}>Email hello@pupular.app</Text>
          </TouchableOpacity>

          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Direct email</Text>
            <Text style={styles.infoValue}>{EMAIL_ADDRESS}</Text>
          </View>

          <TouchableOpacity style={styles.secondaryRow} onPress={() => copyEmailAddress()}>
            <Ionicons name="copy-outline" size={18} color={COLORS.sky} />
            <Text style={styles.secondaryText}>Copy email address</Text>
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
  primaryButton: {
    minHeight: 48,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.coral,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 18,
    paddingVertical: 14,
    ...SHADOW.button(COLORS.coral),
  },
  primaryButtonText: { color: COLORS.white, fontSize: 15, fontWeight: '800' },
  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: 16,
    marginTop: 16,
  },
  infoLabel: { fontSize: 13, fontWeight: '700', color: COLORS.muted, marginBottom: 4 },
  infoValue: { fontSize: 16, fontWeight: '700', color: COLORS.ink },
  secondaryRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 16,
    paddingVertical: 12,
  },
  secondaryText: { fontSize: 15, fontWeight: '600', color: COLORS.ink },
});
