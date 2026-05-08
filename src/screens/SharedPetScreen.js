import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

import { COLORS, RADIUS } from '../constants/theme';
import { useUser } from '../context/AppContext';
import { fetchAnimalById } from '../services/rescueGroupsApi';

export default function SharedPetScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { profile } = useUser();
  const id = route.params?.id;
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function openSharedPet() {
      if (!id) {
        setError('This shared pet link is missing a pet ID.');
        return;
      }

      try {
        const animal = await fetchAnimalById(id);
        if (!cancelled) {
          navigation.replace('PetDetail', { animal });
        }
      } catch (err) {
        if (!cancelled) {
          setError(`We couldn't load that pet right now. They may no longer be available, or the rescue listing may have changed.`);
        }
      }
    }

    openSharedPet();
    return () => { cancelled = true; };
  }, [id, navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        {!error ? (
          <>
            <ActivityIndicator size="large" color={COLORS.coral} />
            <Text style={styles.title}>Opening shared pet…</Text>
            <Text style={styles.sub}>Fetching this Pupular profile.</Text>
          </>
        ) : (
          <>
            <Ionicons name="paw-outline" size={34} color={COLORS.coral} />
            <Text style={styles.title}>Pet link unavailable</Text>
            <Text style={styles.sub}>{error}</Text>
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate(profile?.onboarded ? 'Main' : 'Onboarding')} activeOpacity={0.85}>
              <Text style={styles.buttonText}>Browse pets instead</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  title: {
    color: COLORS.ink,
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
  },
  sub: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
  button: {
    marginTop: 8,
    minHeight: 48,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.coral,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '800',
  },
});
