/**
 * Memento design system.
 * Palette derived from the Memento logo: a purple/magenta script wordmark
 * and a QR-patterned ribbon in violet tones. The theme aims for a calm,
 * dignified, memorial feel appropriate for a digital reminiscence app.
 */

export const colors = {
  // Core brand purples (sampled from the logo)
  primary: '#8B2C8E', // magenta-purple of the "emento" script
  primaryDark: '#5E1F63', // deep ribbon shadow
  primaryDeep: '#2A1230', // near-black plum, used for splash/dark surfaces
  accent: '#B0479E', // lighter violet highlight
  accentSoft: '#C98FC4', // soft lilac (QR fill tone)

  // Neutrals / lavender tints
  lavender: '#EBDDEC',
  lavenderMist: '#F6EFF7',
  surface: '#FFFFFF',
  background: '#FBF7FC',
  card: '#FFFFFF',

  // Text
  ink: '#2C1A2E',
  inkMuted: '#6B5A6E',
  inkFaint: '#9C8C9E',
  onPrimary: '#FFFFFF',

  // Utility
  border: '#E7DAE9',
  borderStrong: '#D9C6DC',
  success: '#3E9D6B',
  warning: '#C9862B',
  danger: '#C0392B',
  overlay: 'rgba(42, 18, 48, 0.55)',

  // Warm memorial accent (candle/brass) — used sparingly for eyebrow + trust marks
  warm: '#C9A24B',
  warmSoft: '#E8D3A2',

  // Surfaces / states
  inputBg: '#FCFAFD',
  inputFocusBg: '#FFFFFF',
  focusRing: 'rgba(139, 44, 142, 0.16)',
  heroGlow: 'rgba(197, 129, 196, 0.55)',
  onDarkFaint: 'rgba(255,255,255,0.72)',

  // Neutral track for progress bars / rails
  track: '#ECE1EE',
  // Very soft tinted surface for nested/secondary panels
  tintSurface: '#FAF4FB',
  onDarkStrong: 'rgba(255,255,255,0.92)',
};

// Gradients (used with expo-linear-gradient)
export const gradients = {
  brand: ['#5E1F63', '#8B2C8E', '#B0479E'],
  hero: ['#2A1230', '#5E1F63'],
  soft: ['#F6EFF7', '#EBDDEC'],
  // Richer, three-stop hero for the auth header (adds depth vs. the flat 2-stop)
  heroRich: ['#241028', '#4A1A50', '#7A2A7E'],
  // Subtle top-highlight sheen laid over the primary button
  sheen: ['rgba(255,255,255,0.28)', 'rgba(255,255,255,0.04)', 'rgba(255,255,255,0)'],
  // Compact brand fill for icon tiles / accents
  tile: ['#9E3AA0', '#6E2472'],
  // Deep plum-to-primary for media/player surfaces
  player: ['#2A1230', '#4A1A50'],
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 999,
};

export const typography = {
  eyebrow: { fontSize: 12, fontWeight: '700', letterSpacing: 1.6, textTransform: 'uppercase' },
  display: { fontSize: 34, fontWeight: '800', letterSpacing: 0.3 },
  title: { fontSize: 26, fontWeight: '700' },
  heading: { fontSize: 20, fontWeight: '700' },
  subtitle: { fontSize: 17, fontWeight: '600' },
  body: { fontSize: 15, fontWeight: '400', lineHeight: 22 },
  label: { fontSize: 13, fontWeight: '600', letterSpacing: 0.4 },
  caption: { fontSize: 12, fontWeight: '500' },
};

export const shadow = {
  card: {
    shadowColor: '#2A1230',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  soft: {
    shadowColor: '#2A1230',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  // Elevated focus glow for inputs / primary CTA
  focus: {
    shadowColor: '#8B2C8E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 5,
  },
  // Deeper lift for framed keepsakes (e.g. the generated QR card)
  raised: {
    shadowColor: '#2A1230',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 26,
    elevation: 9,
  },
};

export default { colors, gradients, spacing, radius, typography, shadow };
