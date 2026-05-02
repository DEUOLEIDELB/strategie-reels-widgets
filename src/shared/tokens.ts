// Tokens design exposés en TS pour usage runtime (animations, calculs).
// Source de vérité Tailwind = tailwind.config.ts.

export const COLORS = {
  bg: '#F4F3F7',
  surface: '#FFFFFF',
  surfaceAlt: '#ECEAF1',
  surfaceTwo: '#F7F5FA',
  border: '#E5DFD9',
  borderStrong: '#B8B0A8',
  text: '#191919',
  textDim: '#4A4A4A',
  textFaint: '#6B6B6B',
  textMuted: '#8A8278',
  accent: '#FFDD0B',
  accentStrong: '#8B6F00',
  accentSoft: '#FFF6BC',
  current: '#5914D0',
  currentSoft: '#EEE2FB',
  info: '#1DC1F9',
  infoStrong: '#0E6F90',
  infoSoft: '#E0F6FE',
  danger: '#D40272',
  dangerSoft: '#FFE3EE',
  success: '#1F8A4A',
  successSoft: '#E5F4ED',
  warning: '#B36B00',
  warningSoft: '#FFF1D6',
} as const;

export const RADIUS = { sm: 4, md: 6, lg: 10 } as const;
export const SHADOWS = {
  sm: '1px 1px 0 #B8B0A8',
  md: '0 2px 0 #E5DFD9',
  lg: '2px 2px 0 #191919',
} as const;
export const ANIM = {
  fast: 150,
  normal: 250,
  energetic: 400,
  easeOut: 'cubic-bezier(0.32, 0.72, 0, 1)',
} as const;
