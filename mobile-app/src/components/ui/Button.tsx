import React, { useRef } from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  Animated,
  PressableProps,
  View,
} from 'react-native';
import { colors, borderRadius, fontSize, fontWeight, shadows } from '../../constants/theme';

interface ButtonProps extends PressableProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
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
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (!isDisabled) {
      Animated.spring(scale, {
        toValue: 0.95,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (!isDisabled) {
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    }
  };

  const buttonStyles = [
    styles.base,
    styles[`variant_${variant}` as keyof typeof styles],
    styles[`size_${size}` as keyof typeof styles],
    isDisabled && styles.disabled,
    ...(Array.isArray(style) ? style : [style]),
  ].filter(Boolean) as ViewStyle[];

  const textStyles = [
    styles.text,
    styles[`text_${variant}` as keyof typeof styles],
    styles[`textSize_${size}` as keyof typeof styles],
  ].filter(Boolean) as TextStyle[];

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        style={buttonStyles}
        disabled={isDisabled}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        {...props}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={variant === 'ghost' || variant === 'secondary' || variant === 'glass' ? colors.brand.cyan : colors.white}
          />
        ) : typeof children === 'string' ? (
          <Text style={textStyles}>{children}</Text>
        ) : (
          children
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
  },
  // Variants
  variant_primary: {
    backgroundColor: colors.brand.blue,
    ...shadows.glow(colors.brand.glow),
  },
  variant_secondary: {
    backgroundColor: colors.surface.raised,
  },
  variant_danger: {
    backgroundColor: colors.status.critical,
    ...shadows.glow('rgba(244, 63, 94, 0.4)'),
  },
  variant_ghost: {
    backgroundColor: colors.transparent,
    borderWidth: 1,
    borderColor: colors.surface.raised,
  },
  variant_glass: {
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(79, 70, 229, 0.3)',
  },
  // Sizes
  size_sm: {
    height: 36,
    paddingHorizontal: 16,
  },
  size_md: {
    height: 48,
    paddingHorizontal: 24,
  },
  size_lg: {
    height: 56,
    paddingHorizontal: 32,
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
  text_glass: {
    color: colors.brand.cyan,
  },
  textSize_sm: {
    fontSize: fontSize.sm,
  },
  textSize_md: {
    fontSize: fontSize.base,
  },
  textSize_lg: {
    fontSize: fontSize.lg,
  },
  disabled: {
    opacity: 0.4,
  },
});
