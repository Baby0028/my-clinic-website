/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        // 'Inter' is already a default, but we add 'Playfair Display'
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      colors: {
        // Custom colors for the soft gradient
        peach: {
          100: '#FFF0E6', // Lightest peach
          200: '#FFE1CC',
          600: '#E67E22', // Example darker peach
        },
        cyan: {
          100: '#E0F7FA', // Lightest cyan
          200: '#B2EBF2',
          600: '#00ACC1', // Main brand cyan
        },
      },
    },
  },
  plugins: [],
}