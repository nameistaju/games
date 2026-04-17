/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0B1D26",
        accent: "#1F7A8C",
        highlight: "#D4AF37",
      },
    },
  },
  plugins: [],
}
