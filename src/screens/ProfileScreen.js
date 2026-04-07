import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../context/AppContext';
import { COLORS, RADIUS, SHADOW } from '../constants/theme';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { profile, liked, superLiked, stats, finishOnboarding } = useUser();
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(profile.name || '');

  const saveName = () => {
    finishOnboarding({ ...profile, name: nameInput.trim() || 'Pet Lover' });
    setEditingName(false);
  };

  const Row = ({ icon, label, value, color = COLORS.coral, onPress }) => (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
      <View style={[styles.rowIcon, { backgroundColor: color + '18' }]}>
        <Ionicons name={icon} size={19} color={color} />
      </View>
      <Text style={styles.rowLabel}>{label}</Text>
      {value ? <Text style={styles.rowValue}>{value}</Text> : null}
      {onPress && <Ionicons name="chevron-forward" size={16} color={COLORS.muted} style={{ marginLeft: 4 }} />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Avatar */}
        <View style={styles.avatar}>
          <Text style={styles.avatarEmoji}>🐾</Text>
        </View>
        {editingName ? (
          <View style={styles.nameEditRow}>
            <TextInput
              style={styles.nameInput}
              value={nameInput}
              onChangeText={setNameInput}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={saveName}
              placeholder="Your name"
              placeholderTextColor={COLORS.muted}
            />
            <TouchableOpacity onPress={saveName} style={styles.nameSaveBtn}>
              <Ionicons name="checkmark" size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity onPress={() => { setNameInput(profile.name || ''); setEditingName(true); }} style={styles.nameRow}>
            <Text style={styles.name}>{profile.name || 'Pet Lover'}</Text>
            <Ionicons name="pencil-outline" size={16} color={COLORS.muted} style={{ marginLeft: 6, marginTop: 4 }} />
          </TouchableOpacity>
        )}
        <Text style={styles.location}>📍 {profile.postalcode || '—'}</Text>

        {/* Stats */}
        <View style={styles.statsRow}>
          <Stat n={liked.length} label="Liked" emoji="❤️" />
          <View style={styles.statDiv} />
          <Stat n={superLiked.length} label="Super" emoji="⭐" />
          <View style={styles.statDiv} />
          <Stat n={stats.totalSwiped} label="Swiped" emoji="🐾" />
        </View>

        {/* Streak */}
        {stats.likeStreak >= 3 && (
          <View style={styles.streakCard}>
            <Text style={styles.streakEmoji}>🔥</Text>
            <View>
              <Text style={styles.streakTitle}>{stats.likeStreak} like streak!</Text>
              <Text style={styles.streakSub}>You're on a roll 🎉</Text>
            </View>
          </View>
        )}

        {/* Settings */}
        <Text style={styles.sectionLabel}>SETTINGS</Text>
        <View style={styles.card}>
          <Row 
            icon="person-outline" 
            label="Edit Preferences" 
            value="Location, species"
            color="#9B59B6" 
            onPress={() => navigation.navigate('EditPreferences')} 
          />
          <Row icon="location-outline" label="Location" value={profile.postalcode} color={COLORS.coral} />
          <Row icon="notifications-outline" label="Notifications" color="#FF9A56" onPress={() => Alert.alert(
            '🔔 Notifications',
            'Push notifications are coming soon! You\'ll get alerts when new pets matching your preferences are added nearby.',
            [{ text: 'Got it', style: 'cancel' }]
          )} />
        </View>

        {/* About */}
        <Text style={styles.sectionLabel}>ABOUT</Text>
        <View style={styles.card}>
          <Row icon="heart-outline" label="About Pupular" color={COLORS.coral} onPress={() => Alert.alert(
            '🐾 About Pupular',
            'Pupular helps you find your forever pet.\n\nSwipe through thousands of rescue animals near you — dogs, cats, rabbits, and more. Each swipe could save a life.\n\nPowered by RescueGroups.org · Free forever.',
            [{ text: 'Visit Website', onPress: () => Linking.openURL('https://pupular.app') }, { text: 'Close', style: 'cancel' }]
          )} />
          <Row icon="globe-outline" label="RescueGroups.org" value="Powered by" color={COLORS.sky} onPress={() => Linking.openURL('https://rescuegroups.org')} />
          <Row icon="mail-outline" label="Contact Us" color={COLORS.mint} onPress={() => Linking.openURL('mailto:hello@pupular.app')} />
          <Row icon="document-text-outline" label="Privacy Policy" color={COLORS.muted} onPress={() => Linking.openURL('https://pupular.app/privacy')} />
        </View>

        <Text style={styles.footer}>🐾 Pupular v1.0 · Made with ❤️ for pets</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ n, label, emoji }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statEmoji}>{emoji}</Text>
      <Text style={styles.statN}>{n}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  avatar: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: COLORS.coralGlow, alignSelf: 'center',
    alignItems: 'center', justifyContent: 'center', marginTop: 20,
    ...SHADOW.soft,
  },
  avatarEmoji: { fontSize: 42 },
  nameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  name: { fontSize: 24, fontWeight: '900', color: COLORS.ink, textAlign: 'center', letterSpacing: -0.5 },
  nameEditRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, marginHorizontal: 40, gap: 8 },
  nameInput: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: RADIUS.lg,
    paddingHorizontal: 16, paddingVertical: 10, fontSize: 18, fontWeight: '700',
    color: COLORS.ink, textAlign: 'center', borderWidth: 2, borderColor: COLORS.coral,
  },
  nameSaveBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.coral,
    alignItems: 'center', justifyContent: 'center',
  },
  location: { fontSize: 13, color: COLORS.muted, textAlign: 'center', marginTop: 4 },
  statsRow: {
    flexDirection: 'row', backgroundColor: COLORS.white,
    marginHorizontal: 20, borderRadius: RADIUS.xl, padding: 20, marginTop: 20,
    ...SHADOW.soft,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 2 },
  statEmoji: { fontSize: 20 },
  statN: { fontSize: 26, fontWeight: '900', color: COLORS.ink },
  statLabel: { fontSize: 11, color: COLORS.muted, fontWeight: '600' },
  statDiv: { width: 1, backgroundColor: COLORS.border },
  streakCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#FFF8F0', borderRadius: RADIUS.xl,
    marginHorizontal: 20, marginTop: 14, padding: 16,
    borderWidth: 1.5, borderColor: '#FFCC80',
  },
  streakEmoji: { fontSize: 32 },
  streakTitle: { fontSize: 16, fontWeight: '800', color: '#E65100' },
  streakSub: { fontSize: 12, color: '#BF6000', marginTop: 2 },
  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: COLORS.muted, letterSpacing: 1.2,
    marginHorizontal: 24, marginTop: 24, marginBottom: 8,
  },
  card: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.xl,
    marginHorizontal: 20, overflow: 'hidden', ...SHADOW.soft,
  },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 14, paddingHorizontal: 16,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  rowIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: COLORS.ink },
  rowValue: { fontSize: 13, color: COLORS.muted },
  footer: { textAlign: 'center', color: COLORS.muted, fontSize: 12, margin: 32 },
});
