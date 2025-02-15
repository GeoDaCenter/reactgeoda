import type {Config} from 'tailwindcss';
import {nextui} from '@nextui-org/react';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))'
      },
      keyframes: {
        fadeInOut: {
          '0%, 100%': {opacity: '0'},
          '16%, 33%': {opacity: '1'},
          '50%': {opacity: '0'}
        }
      },
      animation: {
        'fade-in-out-1': 'fadeInOut 3s ease-in-out infinite',
        'fade-in-out-2': 'fadeInOut 3s ease-in-out infinite 1s',
        'fade-in-out-3': 'fadeInOut 3s ease-in-out infinite 2s'
      }
    }
  },
  darkMode: 'class',
  plugins: [
    nextui({
      themes: {
        'purple-dark': {
          extend: 'dark', // <- inherit default values from dark theme
          colors: {
            background: '#0D001A',
            foreground: '#ffffff',
            primary: {
              50: '#3B096C',
              100: '#520F83',
              200: '#7318A2',
              300: '#9823C2',
              400: '#c031e2',
              500: '#DD62ED',
              600: '#F182F6',
              700: '#FCADF9',
              800: '#FDD5F9',
              900: '#FEECFE',
              DEFAULT: '#DD62ED',
              foreground: '#ffffff'
            },
            focus: '#F182F6'
          },
          layout: {
            disabledOpacity: '0.3',
            radius: {
              small: '4px',
              medium: '6px',
              large: '8px'
            },
            borderWidth: {
              small: '1px',
              medium: '2px',
              large: '3px'
            }
          }
        }
      }
    })
  ]
};
export default config;
