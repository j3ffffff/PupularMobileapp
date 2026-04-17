import React from 'react';
import {
  View, Text, StyleSheet, FlatList, Image,
  TouchableOpacity, Dimensions, Share, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../context/AppContext';
import { COLORS, RADIUS, SHADOW, SPECIES_EMOJI } from '../constants/theme';

const { width: W } = Dimensions.get('window');
const GAP = 10;
const CARD = (W - 40 - GAP) / 2;

const shareAnimal = async (animal) => {
  const locationLabel = [animal.location?.city || animal.org?.city, animal.location?.state || animal.org?.state]
    .filter(Boolean)
    .join(', ');
  const canonicalUrl = animal.id ? `https://www.pupular.app/animal/${encodeURIComponent(animal.id)}` : 'https://www.pupular.app';
  const summaryBits = [
    `${animal.name} on Pupular 🐾`,
    animal.breedPrimary ? `${animal.breedPrimary}${animal.isMixed ? ' mix' : ''}` : null,
    animal.ageGroup || animal.species,
    locationLabel ? `Near ${locationLabel}` : null,
  ].filter(Boolean);

  try {
    await Share.share({
      title: `Meet ${animal.name}`,
      message: `${summaryBits.join(' · ')}\n\nCheck out ${animal.name}'s profile: ${canonicalUrl}`,
      url: canonicalUrl,
    });
  } catch (error) {
    Alert.alert('Share unavailable', `We couldn't open the share sheet right now. ${error?.message || ''}`.trim());
  }
};

export default function LikesScreen() {
  const nav = useNavigation();
  const { liked, unlikeAnimal, superLiked } = useUser();

  if (liked.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Liked Pets</Text>
        </View>
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>💔</Text>
          <Text style={styles.emptyTitle}>No liked pets yet</Text>
          <Text style={styles.emptySub}>Swipe right on pets you love and they'll appear here.</Text>
          <TouchableOpacity style={styles.discoverBtn} onPress={() => nav.navigate('Discover')}>
            <Text style={styles.discoverBtnText}>Start discovering 🐾</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Liked Pets</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{liked.length}</Text>
        </View>
      </View>

      <FlatList
        data={liked}
        numColumns={2}
        keyExtractor={(a) => a.id.toString()}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={{ gap: GAP }}
        ItemSeparatorComponent={() => <View style={{ height: GAP }} />}
        renderItem={({ item }) => {
          const isSuper = superLiked.some((a) => a.id === item.id);
          const emoji = SPECIES_EMOJI[item.species] || SPECIES_EMOJI.default;
          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => nav.navigate('PetDetail', { animal: item })}
              activeOpacity={0.9}
            >
              {item.primaryPhoto ? (
                <Image source={{ uri: item.primaryPhoto }} style={styles.cardImg} resizeMode="cover" />
              ) : (
                <View style={[styles.cardImg, styles.noPhoto]}>
                  <Text style={{ fontSize: 40 }}>{emoji}</Text>
                </View>
              )}
              <View style={styles.cardOverlay} />

              {isSuper && (
                <View style={styles.superTag}>
                  <Text style={styles.superTagText}>⭐</Text>
                </View>
              )}

              <TouchableOpacity style={styles.shareBtn} onPress={() => shareAnimal(item)}>
                <Ionicons name="share-social" size={14} color={COLORS.white} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.unlikeBtn} onPress={() => unlikeAnimal(item.id)}>
                <Ionicons name="close" size={14} color={COLORS.white} />
              </TouchableOpacity>

              <View style={styles.cardInfo}>
                <Text style={styles.cardName}>{item.name}</Text>
                <Text style={styles.cardBreed} numberOfLines={1}>{item.breedPrimary}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16,
  },
  title: { fontSize: 26, fontWeight: '900', color: COLORS.ink, letterSpacing: -0.5 },
  countBadge: {
    backgroundColor: COLORS.coral, borderRadius: RADIUS.pill,
    paddingHorizontal: 10, paddingVertical: 3,
  },
  countText: { color: COLORS.white, fontWeight: '800', fontSize: 14 },
  grid: { paddingHorizontal: 20, paddingBottom: 32 },
  card: { width: CARD, height: CARD * 1.4, borderRadius: RADIUS.xl, overflow: 'hidden', backgroundColor: COLORS.charcoal, ...SHADOW.card },
  cardImg: { width: '100%', height: '100%' },
  noPhoto: { alignItems: 'center', justifyContent: 'center' },
  cardOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%', backgroundColor: 'rgba(0,0,0,0.45)' },
  superTag: {
    position: 'absolute', top: 10, left: 10,
    backgroundColor: 'rgba(77,158,255,0.9)', borderRadius: RADIUS.pill,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  superTagText: { fontSize: 12 },
  shareBtn: {
    position: 'absolute', top: 10, right: 44,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center', justifyContent: 'center',
  },
  unlikeBtn: {
    position: 'absolute', top: 10, right: 10,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center', justifyContent: 'center',
  },
  cardInfo: { position: 'absolute', bottom: 12, left: 12, right: 12 },
  cardName: { fontSize: 16, fontWeight: '800', color: COLORS.white },
  cardBreed: { fontSize: 11, color: 'rgba(255,255,255,0.75)', fontWeight: '500', marginTop: 1 },
  // Empty
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
  emptyEmoji: { fontSize: 60 },
  emptyTitle: { fontSize: 22, fontWeight: '900', color: COLORS.ink },
  emptySub: { fontSize: 14, color: COLORS.muted, textAlign: 'center', lineHeight: 21 },
  discoverBtn: {
    marginTop: 8, backgroundColor: COLORS.coral, borderRadius: RADIUS.pill,
    paddingHorizontal: 28, paddingVertical: 14, ...SHADOW.button(COLORS.coral),
  },
  discoverBtnText: { color: COLORS.white, fontWeight: '800', fontSize: 15 },
});
