import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, borderRadius, fontSize, fontWeight } from '../../constants/theme';

interface StatusBadgeProps {
  status: string;
}

const getStatusStyle = (status: string) => {
  switch (status) {
    case 'OPEN':
      return { bg: 'rgba(244, 63, 94, 0.15)', text: colors.status.critical, border: 'rgba(244, 63, 94, 0.4)' };
    case 'INVESTIGATING':
      return { bg: 'rgba(245, 158, 11, 0.15)', text: colors.status.warning, border: 'rgba(245, 158, 11, 0.4)' };
    case 'CLOSED':
      return { bg: 'rgba(82, 82, 91, 0.3)', text: colors.text.secondary, border: 'rgba(82, 82, 91, 0.5)' };
    case 'RUNNING':
      return { bg: 'rgba(56, 189, 248, 0.15)', text: colors.brand.cyan, border: 'rgba(56, 189, 248, 0.4)' };
    case 'COMPLETED':
      return { bg: 'rgba(16, 185, 129, 0.15)', text: colors.status.safe, border: 'rgba(16, 185, 129, 0.4)' };
    case 'FAILED':
      return { bg: 'rgba(244, 63, 94, 0.15)', text: colors.status.critical, border: 'rgba(244, 63, 94, 0.4)' };
    case 'PENDING':
      return { bg: 'rgba(245, 158, 11, 0.15)', text: colors.status.warning, border: 'rgba(245, 158, 11, 0.4)' };
    default:
      return { bg: 'rgba(82, 82, 91, 0.3)', text: colors.text.secondary, border: 'rgba(82, 82, 91, 0.5)' };
  }
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const style = getStatusStyle(status);

  return (
    <View style={[styles.badge, { backgroundColor: style.bg, borderColor: style.border }]}>
      <Text style={[styles.text, { color: style.text }]}>{status}</Text>
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
});
