/**
 * KAVACH Mobile App — Design System Tokens
 * Upgraded to a sleek, modern, cyber/fintech aesthetic.
 */

export const colors = {
  brand: {
    blue: '#4F46E5', // Indigo-600
    cyan: '#38BDF8', // Sky-400
    glow: 'rgba(79, 70, 229, 0.5)',
  },
  surface: {
    base: '#09090B',      // Zinc-950 (Main background)
    elevated: '#18181B',  // Zinc-900 (Cards, Modals)
    raised: '#27272A',    // Zinc-800 (Borders, Dividers, Input bgs)
    overlay: 'rgba(24, 24, 27, 0.8)', // For glassmorphism
  },
  status: {
    critical: '#F43F5E', // Rose-500
    warning: '#F59E0B',  // Amber-500
    safe: '#10B981',     // Emerald-500
    info: '#3B82F6',     // Blue-500
  },
  text: {
    primary: '#F8FAFC',  // Slate-50
    secondary: '#A1A1AA',// Zinc-400
    muted: '#71717A',    // Zinc-500
  },
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
} as const;

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const fontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 19,
  xl: 22,
  '2xl': 26,
  '3xl': 32,
  '4xl': 40,
} as const;

export const fontWeight = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  }),
  textGlow: (color: string) => ({
    textShadowColor: color,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  }),
} as const;
