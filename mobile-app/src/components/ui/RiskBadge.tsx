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
      return { bg: 'rgba(239, 68, 68, 0.1)', text: colors.status.critical, border: 'rgba(239, 68, 68, 0.5)' };
    case 'HIGH':
      return { bg: 'rgba(245, 158, 11, 0.1)', text: colors.status.warning, border: 'rgba(245, 158, 11, 0.5)' };
    case 'MEDIUM':
      return { bg: 'rgba(59, 130, 246, 0.1)', text: colors.status.info, border: 'rgba(59, 130, 246, 0.5)' };
    default:
      return { bg: 'rgba(16, 185, 129, 0.1)', text: colors.status.safe, border: 'rgba(16, 185, 129, 0.5)' };
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
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    fontFamily: 'monospace',
  },
  compactText: {
    fontSize: 9,
  },
});
