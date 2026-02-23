/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // RODEO Official Brand Colors
        brand: {
          purple: '#800080',        // Primary brand purple
          'purple-light': '#C38BBF', // Secondary light purple
          'gray-dark': '#4D4D4D',    // Dark gray for text/headers
          'gray-light': '#C7C7C7',   // Light gray for borders/subtle backgrounds
          black: '#000000',          // Deep black for high contrast
        },
        // Semantic aliases for easier use
        primary: '#800080',          // Main brand color
        'primary-light': '#C38BBF',  // Light variant
        'primary-dark': '#660066',   // Darker variant (calculated)
      }
    },
  },
  plugins: [],
}
