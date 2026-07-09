import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from 'react-native';
import { colors, borderRadius, fontSize, fontWeight } from '../../constants/theme';

interface ButtonProps extends TouchableOpacityProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  style,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const buttonStyles: ViewStyle[] = [
    styles.base,
    styles[`variant_${variant}`],
    styles[`size_${size}`],
    isDisabled && styles.disabled,
    style as ViewStyle,
  ].filter(Boolean) as ViewStyle[];

  const textStyles: TextStyle[] = [
    styles.text,
    styles[`text_${variant}`],
    styles[`textSize_${size}`],
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      disabled={isDisabled}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'ghost' || variant === 'secondary' ? colors.text.primary : colors.white}
        />
      ) : typeof children === 'string' ? (
        <Text style={textStyles}>{children}</Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
  },
  // Variants
  variant_primary: {
    backgroundColor: colors.brand.blue,
  },
  variant_secondary: {
    backgroundColor: colors.surface.raised,
  },
  variant_danger: {
    backgroundColor: colors.status.critical,
  },
  variant_ghost: {
    backgroundColor: colors.transparent,
    borderWidth: 1,
    borderColor: colors.surface.raised,
  },
  // Sizes
  size_sm: {
    height: 36,
    paddingHorizontal: 12,
  },
  size_md: {
    height: 44,
    paddingHorizontal: 16,
  },
  size_lg: {
    height: 50,
    paddingHorizontal: 24,
  },
  // Text
  text: {
    fontWeight: fontWeight.semibold,
  },
  text_primary: {
    color: colors.white,
  },
  text_secondary: {
    color: colors.text.primary,
  },
  text_danger: {
    color: colors.white,
  },
  text_ghost: {
    color: colors.text.primary,
  },
  textSize_sm: {
    fontSize: fontSize.sm,
  },
  textSize_md: {
    fontSize: fontSize.base,
  },
  textSize_lg: {
    fontSize: fontSize.md,
  },
  disabled: {
    opacity: 0.5,
  },
});
