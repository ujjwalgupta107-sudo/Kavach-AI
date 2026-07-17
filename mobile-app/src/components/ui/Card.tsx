import React from 'react';
import { View, Text, StyleSheet, ViewProps, TextProps } from 'react-native';
import { colors, borderRadius, spacing, fontSize, fontWeight, shadows } from '../../constants/theme';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  variant?: 'default' | 'glow';
}

export function Card({ children, style, variant = 'default', ...props }: CardProps) {
  return (
    <View style={[styles.card, variant === 'glow' && styles.cardGlow, style]} {...props}>
      {children}
    </View>
  );
}

export function CardHeader({ children, style, ...props }: CardProps) {
  return (
    <View style={[styles.header, style]} {...props}>
      {children}
    </View>
  );
}

export function CardTitle({ children, style, ...props }: TextProps & { children: React.ReactNode }) {
  return (
    <Text style={[styles.title, style]} {...props}>
      {children}
    </Text>
  );
}

export function CardContent({ children, style, ...props }: CardProps) {
  return (
    <View style={[styles.content, style]} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface.elevated,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    ...shadows.lg,
    overflow: 'hidden',
  },
  cardGlow: {
    borderColor: 'rgba(56, 189, 248, 0.3)',
    ...shadows.glow(colors.brand.glow),
  },
  header: {
    padding: spacing.lg,
    paddingBottom: spacing.sm,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
  },
  content: {
    padding: spacing.lg,
  },
});
