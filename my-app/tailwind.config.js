/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './context/**/*.{js,jsx}',
    './hooks/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#00BCD4', dark: '#00ACC1', light: '#E0F7FA', 50: '#E0F7FA', 100: '#B2EBF2', 200: '#80DEEA', 500: '#00BCD4', 600: '#00ACC1', 700: '#0097A7' },
        dark: '#1a1a2e',
        darker: '#12121f',
        soft: '#f5f7fa',
        adminbg: '#f0f2f5',
        danger: '#e74c3c',
        muted: '#6c757d',
      },
      fontFamily: {
        sans: ['var(--font-app)', 'Cairo', 'Tajawal', 'system-ui', 'Segoe UI', 'sans-serif'],
      },
      borderRadius: { xl: '12px', '2xl': '16px' },
      spacing: { 4.5: '1.125rem', 13: '3.25rem', 18: '4.5rem' },
      boxShadow: {
        card: '0 2px 12px rgba(16,24,40,.06)',
        hover: '0 12px 32px rgba(16,24,40,.12)',
        nav: '0 2px 10px rgba(0,0,0,.05)',
      },
      keyframes: {
        fadeUp: { '0%': { opacity: 0, transform: 'translateY(24px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        marquee: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
        slideDown: { '0%': { opacity: 0, maxHeight: 0 }, '100%': { opacity: 1, maxHeight: '600px' } },
        pulseRing: { '0%': { transform: 'scale(.9)', opacity: .7 }, '70%': { transform: 'scale(1.6)', opacity: 0 }, '100%': { opacity: 0 } },
      },
      animation: {
        fadeUp: 'fadeUp .6s ease both',
        fadeIn: 'fadeIn .4s ease both',
        marquee: 'marquee 32s linear infinite',
        slideDown: 'slideDown .3s ease both',
        pulseRing: 'pulseRing 2s cubic-bezier(.24,0,.38,1) infinite',
      },
      transitionDuration: { DEFAULT: '300ms' },
    },
  },
  plugins: [],
};
