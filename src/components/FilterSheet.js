import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity,
  TextInput, ScrollView, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAnimals } from '../context/AppContext';
import { COLORS, RADIUS, SHADOW } from '../constants/theme';

const { height: H } = Dimensions.get('window');

const SPECIES_OPTS = [
  { emoji: '🐶', label: 'Dogs', value: 'dogs' },
  { emoji: '🐱', label: 'Cats', value: 'cats' },
  { emoji: '🐰', label: 'Rabbits', value: 'rabbits' },
  { emoji: '🐾', label: 'All Pets', value: null },
];
const AGE_OPTS = [
  { label: '👶 Baby', value: 'Baby' },
  { label: '🐣 Young', value: 'Young' },
  { label: '🐾 Adult', value: 'Adult' },
  { label: '🧓 Senior', value: 'Senior' },
  { label: '✨ Any age', value: null },
];
const SIZE_OPTS = [
  { label: 'Small', value: 'Small' },
  { label: 'Medium', value: 'Medium' },
  { label: 'Large', value: 'Large' },
  { label: 'X-Large', value: 'X-Large' },
  { label: 'Any size', value: null },
];
const SEX_OPTS = [
  { label: '♂ Male', value: 'Male' },
  { label: '♀ Female', value: 'Female' },
  { label: '⚧ Either', value: null },
];
const DISTANCE_OPTS = [5, 10, 25, 50, 100, 250, 500, 1000, 3000].map((miles) => ({
  label: `${miles} mi`,
  value: miles,
}));

export default function FilterSheet({ visible, onClose }) {
  const { filters, applyFilters, loadAnimals } = useAnimals();
  const [local, setLocal] = useState({ ...filters });

  useEffect(() => {
    if (visible) setLocal({ ...filters });
  }, [visible, filters]);

  const set = (key, val) => setLocal((p) => ({ ...p, [key]: val }));

  const apply = () => {
    applyFilters(local);
    loadAnimals(true);
    onClose();
  };

  const reset = () => setLocal({ postalcode: '90210', miles: 100, species: null, ageGroup: null, sizeGroup: null, sex: null });

  const ChipGroup = ({ label, options, field }) => (
    <View style={styles.group}>
      <Text style={styles.groupLabel}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.chips}>
          {options.map((o) => {
            const active = local[field] === o.value;
            return (
              <TouchableOpacity
                key={String(o.value)}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => set(field, o.value)}
                activeOpacity={0.75}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{o.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.sheet}>
        {/* Handle */}
        <View style={styles.handle} />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Filter Pets</Text>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={20} color={COLORS.ink} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
          {/* ZIP */}
          <View style={styles.group}>
            <Text style={styles.groupLabel}>📍 Location (ZIP Code)</Text>
            <TextInput
              style={styles.input}
              value={local.postalcode}
              onChangeText={(v) => set('postalcode', v)}
              placeholder="ZIP code"
              placeholderTextColor={COLORS.muted}
              keyboardType="numeric"
              maxLength={5}
            />
          </View>

          <ChipGroup label="📏 Distance" options={DISTANCE_OPTS} field="miles" />
          <Text style={styles.helperText}>Currently showing pets within {local.miles} miles.</Text>

          {/* Species */}
          <View style={styles.group}>
            <Text style={styles.groupLabel}>🐾 Pet Type</Text>
            <View style={styles.speciesGrid}>
              {SPECIES_OPTS.map((o) => {
                const active = local.species === o.value;
                return (
                  <TouchableOpacity
                    key={String(o.value)}
                    style={[styles.speciesBtn, active && styles.speciesBtnActive]}
                    onPress={() => set('species', o.value)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.speciesEmoji}>{o.emoji}</Text>
                    <Text style={[styles.speciesLabel, active && { color: COLORS.coral }]}>{o.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <ChipGroup label="🎂 Age" options={AGE_OPTS} field="ageGroup" />
          <ChipGroup label="📏 Size" options={SIZE_OPTS} field="sizeGroup" />
          <ChipGroup label="⚧ Sex" options={SEX_OPTS} field="sex" />

          <View style={{ height: 20 }} />
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.resetBtn} onPress={reset}>
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.applyBtn} onPress={apply}>
            <Text style={styles.applyText}>Show Pets 🐾</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheet: { flex: 1, backgroundColor: COLORS.white, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: COLORS.border, alignSelf: 'center', marginTop: 10 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  title: { fontSize: 20, fontWeight: '900', color: COLORS.ink },
  closeBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center',
  },
  body: { flex: 1, paddingHorizontal: 20 },
  group: { marginTop: 20 },
  groupLabel: { fontSize: 14, fontWeight: '700', color: COLORS.ink, marginBottom: 10 },
  input: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.lg,
    paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 16, fontWeight: '600', color: COLORS.ink,
  },
  helperText: {
    marginTop: 10,
    fontSize: 14,
    color: COLORS.muted,
    lineHeight: 20,
  },
  speciesGrid: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  speciesBtn: {
    flex: 1, minWidth: 68, backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg, paddingVertical: 14, alignItems: 'center', gap: 4,
    borderWidth: 2, borderColor: 'transparent',
  },
  speciesBtnActive: { borderColor: COLORS.coral, backgroundColor: COLORS.coralGlow },
  speciesEmoji: { fontSize: 26 },
  speciesLabel: { fontSize: 12, fontWeight: '700', color: COLORS.charcoal },
  chips: { flexDirection: 'row', gap: 8 },
  chip: {
    paddingHorizontal: 16, paddingVertical: 9, borderRadius: RADIUS.pill,
    backgroundColor: COLORS.surface, borderWidth: 2, borderColor: 'transparent',
  },
  chipActive: { borderColor: COLORS.coral, backgroundColor: COLORS.coralGlow },
  chipText: { fontSize: 13, fontWeight: '600', color: COLORS.muted },
  chipTextActive: { color: COLORS.coral },
  footer: {
    flexDirection: 'row', gap: 12, padding: 20, paddingBottom: 36,
    borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  resetBtn: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: RADIUS.pill,
    paddingVertical: 16, alignItems: 'center',
  },
  resetText: { fontSize: 15, fontWeight: '700', color: COLORS.muted },
  applyBtn: {
    flex: 2.5, backgroundColor: COLORS.coral, borderRadius: RADIUS.pill,
    paddingVertical: 16, alignItems: 'center', ...SHADOW.button(COLORS.coral),
  },
  applyText: { color: COLORS.white, fontSize: 16, fontWeight: '800' },
});
