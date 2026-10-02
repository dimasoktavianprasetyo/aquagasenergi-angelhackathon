/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          cyan: '#00e5ff',
          blue: '#0284c7',
          dark: '#0a0e17',
          card: '#121a2a',
        }
      },
      fontFamily: {
        sans: ['"Google Sans Flex"', '"Google Sans Flex Variable"', '"Google Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      }
    },
  },
  plugins: [],
}
