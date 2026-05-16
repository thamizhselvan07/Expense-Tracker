/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#e6fffa',
          100: '#b3fff0',
          500: '#00f5d4',
          600: '#00d6b8',
          700: '#00b89f',
          900: '#007a6a',
        },
        space: {
          bg: '#050812',
          surface: 'rgba(255, 255, 255, 0.04)',
          border: 'rgba(255, 255, 255, 0.08)',
          muted: '#8892a4',
        },
        income: '#39ff14',
        expense: '#ff3864',
      },
      fontFamily: {
        sans: ['var(--font-orbitron)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-dm-mono)', 'monospace'],
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 3s infinite',
        pulseGlow: 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 15px rgba(0, 245, 212, 0.6)' },
          '50%': { opacity: '.7', boxShadow: '0 0 5px rgba(0, 245, 212, 0.2)' },
        },
      },
    },
  },
  plugins: [],
};
