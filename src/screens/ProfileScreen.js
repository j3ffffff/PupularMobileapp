import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking, Alert, TextInput, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useNavigation } from '@react-navigation/native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useAnimals, useUser } from '../context/AppContext';
import { resetPassword } from '../services/auth';
import { COLORS, RADIUS, SHADOW } from '../constants/theme';
import FilterSheet from '../components/FilterSheet';
import { sharePupularApp } from '../utils/shareApp';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const tabBarHeight = useBottomTabBarHeight();
  const { filters } = useAnimals();
  const { profile, liked, superLiked, stats, finishOnboarding, authUser, syncing, authReady, handleSignIn, handleGoogleSignIn, handleEmailSignUp, handleEmailSignIn, handleSignOut } = useUser();
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(profile.name || '');
  const [showFilter, setShowFilter] = useState(false);
  const [appleAvailable, setAppleAvailable] = useState(false);

  // Email auth state
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailName, setEmailName] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'ios') {
      AppleAuthentication.isAvailableAsync().then(setAppleAvailable);
    }
  }, []);

  const saveName = () => {
    finishOnboarding({ ...profile, name: nameInput.trim() || 'Pet Lover' });
    setEditingName(false);
  };

  const handleEmailAuth = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedName = emailName.trim();

    if (!normalizedEmail || !password) {
      Alert.alert('Missing Fields', 'Please enter your email and password.');
      return;
    }
    if (isSignUp && password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters.');
      return;
    }
    setAuthLoading(true);
    try {
      if (isSignUp) {
        await handleEmailSignUp(normalizedEmail, password, normalizedName || undefined);
      } else {
        await handleEmailSignIn(normalizedEmail, password);
      }
      setEmail('');
      setPassword('');
      setEmailName('');
    } catch (e) {
      const msg = e.code === 'auth/email-already-in-use' ? 'This email already has an account. Try signing in instead.'
        : e.code === 'auth/invalid-email' ? 'Please enter a valid email address.'
        : e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential' ? 'Incorrect email or password.'
        : e.code === 'auth/user-not-found' ? 'No account found with this email. Try creating one.'
        : e.message;
      Alert.alert(isSignUp ? 'Sign Up Failed' : 'Sign In Failed', msg);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleInviteFriend = () => sharePupularApp();

  const Row = ({ icon, label, value, color = COLORS.coral, onPress }) => (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
      <View style={[styles.rowIcon, { backgroundColor: color + '18' }]}>
        <Ionicons name={icon} size={19} color={color} />
      </View>
      <View style={styles.rowTextWrap}>
        <Text style={styles.rowLabel}>{label}</Text>
        {value ? <Text style={styles.rowValue}>{value}</Text> : null}
      </View>
      {onPress && <Ionicons name="chevron-forward" size={16} color={COLORS.muted} style={styles.rowChevron} />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.scrollContent, { paddingBottom: tabBarHeight + 24 }]}
      >
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

        {/* Account — Sign In */}
        {!authUser && authReady && (
          <View style={styles.syncCard}>
            <Text style={styles.syncEmoji}>☁️</Text>
            <Text style={styles.syncTitle}>Sync Your Data</Text>
            <Text style={styles.syncSub}>Sign in to save your likes across devices</Text>

            {/* Apple Sign In */}
            {appleAvailable && (
              <AppleAuthentication.AppleAuthenticationButton
                buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                cornerRadius={25}
                style={styles.appleBtn}
                onPress={async () => {
                  try {
                    await handleSignIn();
                  } catch (e) {
                    if (e.code !== 'ERR_REQUEST_CANCELED') {
                      Alert.alert('Sign In Failed', e.message);
                    }
                  }
                }}
              />
            )}

            {/* Google Sign In */}
            {Platform.OS === 'ios' && (
              <TouchableOpacity
                style={styles.googleBtn}
                activeOpacity={0.85}
                onPress={async () => {
                  try {
                    setAuthLoading(true);
                    await handleGoogleSignIn();
                  } catch (e) {
                    if (e.message !== 'Google sign-in was cancelled.') {
                      Alert.alert('Google Sign In Failed', e.message);
                    }
                  } finally {
                    setAuthLoading(false);
                  }
                }}
                disabled={authLoading}
              >
                {authLoading ? (
                  <ActivityIndicator color={COLORS.ink} />
                ) : (
                  <>
                    <Ionicons name="logo-google" size={18} color={COLORS.ink} />
                    <Text style={styles.googleBtnText}>Continue with Google</Text>
                  </>
                )}
              </TouchableOpacity>
            )}

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Email form */}
            {isSignUp && (
              <TextInput
                style={styles.authInput}
                placeholder="Your name"
                placeholderTextColor={COLORS.muted}
                value={emailName}
                onChangeText={setEmailName}
                autoCapitalize="words"
                autoComplete="name"
              />
            )}
            <TextInput
              style={styles.authInput}
              placeholder="Email"
              placeholderTextColor={COLORS.muted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
            <TextInput
              style={styles.authInput}
              placeholder="Password"
              placeholderTextColor={COLORS.muted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
            />
            <TouchableOpacity style={styles.emailBtn} onPress={handleEmailAuth} activeOpacity={0.85} disabled={authLoading}>
              {authLoading
                ? <ActivityIndicator color={COLORS.white} />
                : <Text style={styles.emailBtnText}>{isSignUp ? 'Create Account' : 'Sign In'}</Text>
              }
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsSignUp((v) => !v)}>
              <Text style={styles.toggleText}>
                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Create one"}
              </Text>
            </TouchableOpacity>
            {!isSignUp && (
              <TouchableOpacity onPress={() => {
                if (!email) {
                  Alert.alert('Enter Your Email', 'Type your email above, then tap Forgot Password.');
                  return;
                }
                Alert.alert('Reset Password', `Send a password reset link to ${email}?`, [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Send', onPress: async () => {
                    try {
                      await resetPassword(email);
                      Alert.alert('Email Sent', 'Check your inbox for a password reset link.');
                    } catch (e) {
                      Alert.alert('Error', e.code === 'auth/user-not-found' ? 'No account found with this email.' : e.message);
                    }
                  }},
                ]);
              }}>
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {authUser && (
          <View style={styles.syncCard}>
            <View style={styles.syncedRow}>
              <Text style={styles.syncEmoji}>☁️</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.syncTitle}>{syncing ? 'Syncing...' : 'Synced'}</Text>
                <Text style={styles.syncSub}>{authUser.email || 'Apple ID'}</Text>
              </View>
              <TouchableOpacity style={styles.signOutBtn} onPress={() => {
                Alert.alert('Sign Out', 'Your data will stay on this device but won\'t sync until you sign back in.', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Sign Out', style: 'destructive', onPress: handleSignOut },
                ]);
              }}>
                <Text style={styles.signOutText}>Sign Out</Text>
              </TouchableOpacity>
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
          <Row icon="navigate-outline" label="Distance" value={`${filters.miles} miles`} color={COLORS.likeGreen} onPress={() => setShowFilter(true)} />
          <Row icon="notifications-outline" label="Notifications" color="#FF9A56" onPress={() => Alert.alert(
            '🔔 Notifications',
            'Push notifications are coming soon! You\'ll get alerts when new pets matching your preferences are added nearby.',
            [{ text: 'Got it', style: 'cancel' }]
          )} />
        </View>

        {/* Resources */}
        <Text style={styles.sectionLabel}>RESOURCES</Text>
        <View style={styles.card}>
          <Row icon="construct-outline" label="Adoption Tools" value="Checklist, insurance, invite" color={COLORS.amber} onPress={() => navigation.navigate('AdoptionTools')} />
          <Row icon="share-social-outline" label="Invite a Friend" value="Help more pets get seen" color={COLORS.sky} onPress={handleInviteFriend} />
          <Row icon="checkmark-done-outline" label="New Pet Checklist" value="Prep before you adopt" color={COLORS.likeGreen} onPress={() => navigation.navigate('NewPetChecklist')} />
          <Row icon="shield-checkmark-outline" label="Pet Insurance" value="Helpful value-add" color={COLORS.amber} onPress={() => navigation.navigate('PetInsuranceGuide')} />
        </View>

        {/* About */}
        <Text style={styles.sectionLabel}>ABOUT</Text>
        <View style={styles.card}>
          <Row icon="heart-outline" label="About Pupular" color={COLORS.coral} onPress={() => navigation.navigate('AboutPupular')} />
          <Row icon="globe-outline" label="RescueGroups.org" value="Powered by" color={COLORS.sky} onPress={() => Linking.openURL('https://rescuegroups.org')} />
          <Row icon="mail-outline" label="Contact Us" color={COLORS.mint} onPress={() => navigation.navigate('ContactUs')} />
          <Row icon="document-text-outline" label="Privacy Policy" color={COLORS.muted} onPress={() => navigation.navigate('PrivacyPolicy')} />
        </View>

        <Text style={styles.footer}>🐾 Pupular v1.2 · Made with ❤️ for pets</Text>
      </ScrollView>
      <FilterSheet visible={showFilter} onClose={() => setShowFilter(false)} />
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
  scrollContent: { flexGrow: 1 },
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
  rowTextWrap: { flex: 1, minWidth: 0 },
  rowLabel: { fontSize: 15, fontWeight: '600', color: COLORS.ink },
  rowValue: { fontSize: 13, color: COLORS.muted, marginTop: 2 },
  rowChevron: { marginLeft: 8, flexShrink: 0 },
  footer: { textAlign: 'center', color: COLORS.muted, fontSize: 12, margin: 32 },
  // Sync / Auth
  syncCard: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.xl,
    marginHorizontal: 20, marginTop: 14, padding: 20,
    alignItems: 'center', gap: 8, ...SHADOW.soft,
  },
  syncEmoji: { fontSize: 32 },
  syncTitle: { fontSize: 16, fontWeight: '800', color: COLORS.ink },
  syncSub: { fontSize: 13, color: COLORS.muted, textAlign: 'center' },
  appleBtn: { width: '100%', height: 50, marginTop: 4 },
  googleBtn: {
    width: '100%', minHeight: 50, marginTop: 4,
    borderRadius: RADIUS.pill, borderWidth: 1, borderColor: COLORS.border,
    backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center',
    flexDirection: 'row', gap: 10,
  },
  googleBtnText: { color: COLORS.ink, fontSize: 14, fontWeight: '700' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', width: '100%', marginVertical: 4 },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  dividerText: { marginHorizontal: 14, fontSize: 13, color: COLORS.muted, fontWeight: '600' },
  authInput: {
    width: '100%', backgroundColor: COLORS.surface, borderRadius: RADIUS.lg,
    paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, fontWeight: '600',
    color: COLORS.ink,
  },
  emailBtn: {
    width: '100%', backgroundColor: COLORS.coral, borderRadius: RADIUS.pill,
    paddingVertical: 15, alignItems: 'center', marginTop: 4,
    ...SHADOW.button(COLORS.coral),
  },
  emailBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '800' },
  toggleText: { fontSize: 13, color: COLORS.coral, fontWeight: '600', marginTop: 4 },
  forgotText: { fontSize: 13, color: COLORS.muted, fontWeight: '600', marginTop: 2 },
  syncedRow: { flexDirection: 'row', alignItems: 'center', gap: 12, width: '100%' },
  signOutBtn: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.pill,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  signOutText: { fontSize: 13, fontWeight: '600', color: COLORS.muted },
});
