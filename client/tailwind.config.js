/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Lato', 'sans-serif'],
      },
      colors: {
        background: '#F3F4F6',
        cardBackground: '#FCFCFC',
        navigationBar: '#17235E',
        separators: '#E6EAEE',
        textColor: '#232323',
      },
    },
  },
  plugins: [], 
}
