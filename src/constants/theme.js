// Pupular Design System — Warm, Playful, Addicting
export const COLORS = {
  // Brand
  coral:     '#FF5757',   // primary swipe-right / like
  coralLight:'#FF7A7A',
  coralGlow: 'rgba(255,87,87,0.15)',
  mint:      '#00C6A2',   // swipe-left / pass
  sky:       '#4D9EFF',   // super like / info
  amber:     '#FFB800',   // badges / highlights
  lavender:  '#9B7FFF',   // accents

  // Neutrals
  ink:       '#0F0F14',   // near-black text
  charcoal:  '#1C1C28',   // dark cards
  slate:     '#2E2E3F',   // slightly lighter dark
  muted:     '#8888AA',   // secondary text
  border:    '#EBEBF5',   // dividers
  surface:   '#F5F5FA',   // page bg
  white:     '#FFFFFF',

  // Status
  likeGreen: '#23D18B',
  nopeRed:   '#FF4B6E',
  superBlue:  '#4D9EFF',

  // Transparent overlays
  overlayDark: 'rgba(15,15,20,0.6)',
  overlayCard: 'rgba(15,15,20,0.75)',
};

export const RADIUS = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 999,
};

export const SHADOW = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 10,
  },
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  button: (color = '#FF5757') => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  }),
};

export const AGE_COLORS = {
  Baby:   { bg: '#FFF3CC', text: '#B87C00' },
  Young:  { bg: '#CCFBF1', text: '#0E7A62' },
  Adult:  { bg: '#DBEAFE', text: '#1E56AD' },
  Senior: { bg: '#FDE8FF', text: '#7C3A9B' },
};

export const SPECIES_EMOJI = {
  Dog: '🐶', Cat: '🐱', Rabbit: '🐰',
  Bird: '🐦', Fish: '🐠', Hamster: '🐹',
  Guinea: '🐹', Ferret: '🐾', Snake: '🐍',
  Turtle: '🐢', default: '🐾',
};
