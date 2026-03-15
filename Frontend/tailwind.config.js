/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#030303',
        panel: 'rgba(15, 15, 15, 0.7)',
        accent: '#8b5cf6',
      }
    },
  },
  plugins: [],
}
