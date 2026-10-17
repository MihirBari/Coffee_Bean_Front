/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Pantone Brand Color Palette
        'cream': '#F5EFC6', // Transparent Yellow
        'potting': '#4A2E27', // Potting Soil
        'soil': '#4A2E27',
        'cerulean': '#A5BCD6', // Cerulean Blue
        'java': '#231815', // Java Brown
        'sceptre': '#4D0E12', // Sceptre Red
        'wine': '#4D0E12',
        
        // Semantic aliases
        brand: {
          bg: '#18110E',
          espresso: '#140E0C',
          surface: '#201714',
          surfaceHover: '#2A1F1B',
          cream: '#F6F2E8',
          yellow: '#F5EFC6',
          red: '#5A1217',
          sceptre: '#5A1217',
          blue: '#A5BCD6',
          cerulean: '#A5BCD6',
          gold: '#D6A56E',
          crema: '#D6A56E',
          soil: '#422720',
          potting: '#422720',
          java: '#18110E',
          dark: '#120B09',
          card: '#221815',
          border: 'rgba(246, 242, 232, 0.08)',
          muted: '#A89B93'
        }
      },
      fontFamily: {
        headline: ['"Overpass"', '"Plus Jakarta Sans"', 'sans-serif'],
        subhead: ['"Space Mono"', 'monospace'],
        body: ['"Courier Prime"', 'monospace'],
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        mono: ['"Space Mono"', 'monospace'],
      },
      screens: {
        'xs': '420px',
      }
    },
  },
  plugins: [],
}
