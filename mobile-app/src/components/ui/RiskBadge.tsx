import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, borderRadius, fontSize, fontWeight } from '../../constants/theme';

interface RiskBadgeProps {
  level: string;
  compact?: boolean;
}

const getRiskStyle = (level: string) => {
  switch (level) {
    case 'CRITICAL':
      return { bg: 'rgba(244, 63, 94, 0.15)', text: colors.status.critical, border: 'rgba(244, 63, 94, 0.4)' };
    case 'HIGH':
      return { bg: 'rgba(245, 158, 11, 0.15)', text: colors.status.warning, border: 'rgba(245, 158, 11, 0.4)' };
    case 'MEDIUM':
      return { bg: 'rgba(56, 189, 248, 0.15)', text: colors.brand.cyan, border: 'rgba(56, 189, 248, 0.4)' };
    default:
      return { bg: 'rgba(16, 185, 129, 0.15)', text: colors.status.safe, border: 'rgba(16, 185, 129, 0.4)' };
  }
};

export function RiskBadge({ level, compact = false }: RiskBadgeProps) {
  const style = getRiskStyle(level);

  return (
    <View style={[styles.badge, { backgroundColor: style.bg, borderColor: style.border }]}>
      <Text style={[styles.text, { color: style.text }, compact && styles.compactText]}>
        {level}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.5,
  },
  compactText: {
    fontSize: 9,
    paddingHorizontal: 2,
    paddingVertical: 1,
  },
});
