/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./views/**/*.ejs",
    "./src/**/*.ts"
  ],
  darkMode: 'class', // Instructs Tailwind to look for a 'dark' class on the HTML tag
  theme: {
    extend: {
      colors: {
        eco: {
          50: '#f0fdf4',  // Crisp mint white for light mode backgrounds
          500: '#22c55e', // Vibrant forest green for buttons/links in light mode
          800: '#166534', // Deep slate-green for dark mode backgrounds
          900: '#14532d', // Darkest slate for dark mode contrasting elements
          neon: '#4ade80',// Bright neon-leaf accent for dark mode readability
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'], // Clean, standard web-dev typography
      }
    },
  },
  plugins: [],
}