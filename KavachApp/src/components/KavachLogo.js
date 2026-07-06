// src/components/KavachLogo.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { THEME } from '../utils/theme';

export default function KavachLogo({ size = 32, showText = true }) {
  return (
    <View style={styles.container}>
      <View style={styles.shieldGlow}>
        <MaterialCommunityIcons name="shield-lock-outline" size={size} color={THEME.secondaryGlow} />
      </View>
      {showText && (
        <View style={styles.textWrapper}>
          <Text style={styles.title}>KAVACH <Text style={{ color: THEME.primaryGlow }}>AI</Text></Text>
          <Text style={styles.subTitle}>SHIELDING CITIZENS</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center' },
  shieldGlow: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
  },
  textWrapper: { marginLeft: 12 },
  title: { fontSize: 20, fontWeight: '900', color: THEME.textPrimary, letterSpacing: 1 },
  subTitle: { fontSize: 9, color: THEME.textSecondary, letterSpacing: 1.5, fontWeight: '700', marginTop: -2 },
});