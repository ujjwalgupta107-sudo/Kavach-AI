import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, borderRadius, fontSize, fontWeight } from '../../constants/theme';

interface StatusBadgeProps {
  status: string;
}

const getStatusStyle = (status: string) => {
  switch (status) {
    case 'OPEN':
      return { bg: 'rgba(239, 68, 68, 0.1)', text: colors.status.critical };
    case 'INVESTIGATING':
      return { bg: 'rgba(245, 158, 11, 0.1)', text: colors.status.warning };
    case 'CLOSED':
      return { bg: 'rgba(51, 65, 85, 0.5)', text: colors.text.secondary };
    case 'RUNNING':
      return { bg: 'rgba(6, 182, 212, 0.1)', text: colors.brand.cyan };
    case 'COMPLETED':
      return { bg: 'rgba(16, 185, 129, 0.1)', text: colors.status.safe };
    case 'FAILED':
      return { bg: 'rgba(239, 68, 68, 0.1)', text: colors.status.critical };
    case 'PENDING':
      return { bg: 'rgba(245, 158, 11, 0.1)', text: colors.status.warning };
    default:
      return { bg: 'rgba(51, 65, 85, 0.5)', text: colors.text.secondary };
  }
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const style = getStatusStyle(status);

  return (
    <View style={[styles.badge, { backgroundColor: style.bg }]}>
      <Text style={[styles.text, { color: style.text }]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
});
