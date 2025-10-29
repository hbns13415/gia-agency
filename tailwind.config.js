/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        'gia-bg': '#0b1020',
        'gia-accent': '#00d0ff',
        'gia-accent-2': '#6a5cff',
        'gia-card': '#0f1724'
      },
      boxShadow: {
        'neon': '0 4px 30px rgba(0,208,255,0.08), 0 0 18px rgba(0,208,255,0.12)'
      }
    },
    fontFamily: {
      sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial']
    }
  },
  plugins: [],
}