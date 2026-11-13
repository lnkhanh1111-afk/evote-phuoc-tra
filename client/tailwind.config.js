/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        hdnd: {
          red: '#c9141d',
          darkred: '#990000',
          gold: '#facc15',
          golddark: '#ca8a04',
          navy: '#0f172a',
          blue: '#1e3a8a',
          green: '#15803d',
          greenbright: '#22c55e',
        }
      }
    },
  },
  plugins: [],
}
