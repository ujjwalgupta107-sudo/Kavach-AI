import React, { useState } from 'react';
import { TextInput, StyleSheet, TextInputProps, View, Text } from 'react-native';
import { colors, borderRadius, spacing, fontSize, shadows } from '../../constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ label, error, style, onFocus, onBlur, ...props }: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          isFocused && styles.inputFocused,
          error && styles.inputError,
          style,
        ]}
        placeholderTextColor={colors.text.muted}
        selectionColor={colors.brand.cyan}
        onFocus={(e) => {
          setIsFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          onBlur?.(e);
        }}
        {...props}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: colors.text.secondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    height: 48,
    backgroundColor: 'rgba(24, 24, 27, 0.5)', // slightly transparent zinc-900
    borderWidth: 1,
    borderColor: colors.surface.raised,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    fontSize: fontSize.base,
    color: colors.text.primary,
  },
  inputFocused: {
    borderColor: colors.brand.cyan,
    backgroundColor: 'rgba(24, 24, 27, 0.8)',
    ...shadows.glow('rgba(56, 189, 248, 0.2)'),
  },
  inputError: {
    borderColor: colors.status.critical,
    ...shadows.glow('rgba(244, 63, 94, 0.2)'),
  },
  error: {
    fontSize: fontSize.xs,
    color: colors.status.critical,
    marginTop: 6,
  },
});
