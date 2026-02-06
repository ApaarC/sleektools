/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Premium Graphite/Obsidian Dark Palette
        surface: {
          950: '#050506',
          900: '#0B0B0F',
          850: '#0E0E12',
          800: '#111114',
          750: '#151518',
          700: '#1A1A1E',
          600: '#26262C',
          500: '#3A3A44',
          400: '#6B6B7A',
          300: '#9898A8',
          200: '#B8B8C7',
          100: '#D4D4E0',
          50: '#EDEDF4',
        },
        // Metallic Silver accent
        silver: {
          50: '#FAFAFA',
          100: '#F4F4F5',
          200: '#E4E4E7',
          300: '#D4D4D8',
          400: '#A1A1AA',
          500: '#71717A',
          600: '#52525B',
          700: '#3F3F46',
          800: '#27272A',
          900: '#18181B',
        },
        // Muted Crimson accent
        crimson: {
          50: '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#F87171',
          500: '#DC2626',
          600: '#B91C1C',
          700: '#991B1B',
          800: '#7F1D1D',
          900: '#450A0A',
        },
        // Steel blue-grey
        steel: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
        // Teal for success
        teal: {
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0D9488',
        },
        // Amber for warnings
        amber: {
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      animation: {
        'fade-in': 'fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in-up': 'fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(255, 255, 255, 0.02)' },
          '100%': { boxShadow: '0 0 30px rgba(255, 255, 255, 0.05)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glow-sm': '0 0 12px rgba(255, 255, 255, 0.03)',
        'glow': '0 0 24px rgba(255, 255, 255, 0.04)',
        'glow-lg': '0 0 40px rgba(255, 255, 255, 0.06)',
        'elevation-1': '0 1px 2px rgba(0, 0, 0, 0.5)',
        'elevation-2': '0 2px 8px rgba(0, 0, 0, 0.4), 0 1px 2px rgba(0, 0, 0, 0.5)',
        'elevation-3': '0 8px 24px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.3)',
        'elevation-4': '0 16px 48px rgba(0, 0, 0, 0.4), 0 4px 16px rgba(0, 0, 0, 0.3)',
        'inner-glow': 'inset 0 1px 0 rgba(255, 255, 255, 0.04)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
}
