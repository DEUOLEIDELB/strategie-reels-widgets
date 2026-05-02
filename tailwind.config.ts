import type { Config } from 'tailwindcss';

// Design tokens Wubo : repris du wubo-pilotage-widgets/lib/styles.css.
// On ajoute des utilitaires Tailwind alignés sur la palette officielle.
const config: Config = {
  content: ['./src/**/*.{ts,tsx,html}'],
  theme: {
    extend: {
      colors: {
        // Surfaces neutres avec hint violet imperceptible (Wubo DNA)
        bg: '#F4F3F7',
        surface: {
          DEFAULT: '#FFFFFF',
          alt: '#ECEAF1',
          two: '#F7F5FA',
        },
        border: {
          DEFAULT: '#E5DFD9',
          strong: '#B8B0A8',
        },
        text: {
          DEFAULT: '#191919',
          dim: '#4A4A4A',
          faint: '#6B6B6B',
          muted: '#8A8278',
        },
        // Couleurs de marque Wubo (palette officielle)
        accent: {
          DEFAULT: '#FFDD0B', // jaune Wubo, CTA principal
          strong: '#8B6F00',
          soft: '#FFF6BC',
        },
        current: {
          DEFAULT: '#5914D0', // violet Wubo, état courant/focus
          soft: '#EEE2FB',
        },
        info: {
          DEFAULT: '#1DC1F9', // bleu Wubo
          strong: '#0E6F90',
          soft: '#E0F6FE',
        },
        danger: {
          DEFAULT: '#D40272', // pink Wubo, destructif/erreur
          soft: '#FFE3EE',
        },
        success: {
          DEFAULT: '#1F8A4A',
          soft: '#E5F4ED',
        },
        warning: {
          DEFAULT: '#B36B00',
          soft: '#FFF1D6',
        },
        // Couleurs de texte sur fond coloré (constants, jamais theme-dépendant)
        on: {
          accent: '#191919',
          current: '#FFFFFF',
          danger: '#FFFFFF',
          success: '#FFFFFF',
          warning: '#FFFFFF',
        },
      },
      borderRadius: {
        sm: '4px',
        md: '6px',
        lg: '10px',
      },
      boxShadow: {
        // DA Wubo : offset solide uniquement, zéro blur
        sm: '1px 1px 0 #B8B0A8',
        md: '0 2px 0 #E5DFD9',
        lg: '2px 2px 0 #191919',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
