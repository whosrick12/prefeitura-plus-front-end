/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1a56db',
        secondary: '#f3f4f6',
        accent: '#eab308',
        dark: '#1f2937',
      }
    },
  },
  plugins: [],
}