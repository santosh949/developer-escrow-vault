/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#020304',
        surface: 'rgba(20, 25, 20, 0.4)',
        primary: '#00ff41',
        secondary: '#00b8ff',
        danger: '#ff3131',
        warning: '#ffb800',
        text: '#a8f0b8',
        textMuted: '#3a5a42',
      },
      fontFamily: {
        mono: ["'JetBrains Mono'", "'Fira Code'", "monospace"],
        sans: ["'Inter'", "'Roboto'", "sans-serif"],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(0, 255, 65, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(0, 255, 65, 0.6)' },
        }
      }
    },
  },
  plugins: [],
}
