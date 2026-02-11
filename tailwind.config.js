/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#006001",
        cream: "#F2E3BB",
      },
      fontFamily: {
        handcraft: ['"Handcraft"', "sans-serif"],
      },
    },
  },
  plugins: [],
};
