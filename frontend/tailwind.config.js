/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        wa: {
          light: '#ece5dd',
          dark: '#111b21',
          panelDark: '#202c33',
          primary: '#25D366',
          teal: '#128C7E',
          tealDark: '#075E54'
        }
      },
      transitionDuration: {
        '600': '600ms',
      }
    },
  },
  plugins: [],
}