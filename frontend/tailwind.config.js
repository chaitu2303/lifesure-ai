/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: {
          50: '#FCFBF9',
          100: '#FAF9F5',
          200: '#F4F2EB',
          300: '#ECE8DF',
          400: '#DDD7CC',
        },
        midnight: {
          950: '#070C18',
          900: '#0B132B',
          800: '#141E3C',
          700: '#1F2C52',
          600: '#2E3F6D',
          500: '#485885',
          400: '#6778A8',
        },
        cobalt: {
          900: '#0F2E7A',
          800: '#1E40AF',
          700: '#1D4ED8',
          600: '#2563EB',
          500: '#3B82F6',
          100: '#DBEAFE',
          50: '#EFF6FF',
        },
        emerald: {
          900: '#064E3B',
          800: '#065F46',
          700: '#047857',
          600: '#059669',
          500: '#10B981',
          100: '#D1FAE5',
          50: '#ECFDF5',
        },
        sand: {
          50: '#FBFBF9',
          100: '#F7F6F2',
          200: '#EFECE4',
          300: '#E4DFD3',
          400: '#C8C1B0',
          500: '#9E9484',
        },
        border: {
          DEFAULT: '#E6E4DF',
          light: '#F0EEE8',
          dark: '#D8D4CA',
        }
      },
      fontFamily: {
        serif: ['Newsreader', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
      boxShadow: {
        'editorial': '0 1px 3px 0 rgba(11, 19, 43, 0.04), 0 1px 2px -1px rgba(11, 19, 43, 0.02)',
        'editorial-hover': '0 8px 24px -4px rgba(11, 19, 43, 0.08), 0 2px 6px -1px rgba(11, 19, 43, 0.03)',
        'editorial-lg': '0 16px 36px -6px rgba(11, 19, 43, 0.1), 0 4px 12px -2px rgba(11, 19, 43, 0.04)',
      }
    },
  },
  plugins: [],
}
