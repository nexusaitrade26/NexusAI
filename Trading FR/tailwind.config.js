/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        nexus: {
          dark: '#060913',
          card: '#0b101d',
          border: 'rgba(59, 130, 246, 0.15)',
          glow: 'rgba(59, 130, 246, 0.3)',
          cyan: '#38bdf8',
          blue: '#3b82f6',
          indigo: '#6366f1',
          emerald: '#10b981',
          rose: '#f43f5e',
        }
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem',
        '4xl': '2.25rem',
      },
      boxShadow: {
        'liquid-glow': '0 0 25px -5px rgba(59, 130, 246, 0.25)',
        'liquid-card': '0 20px 50px rgba(0, 0, 0, 0.4)',
      }
    },
  },
  plugins: [],
}
