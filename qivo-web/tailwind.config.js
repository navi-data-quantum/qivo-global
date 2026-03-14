module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./features/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#ff1a1a",
        secondary: "#00ffff",
        dark: "#0a0a0a",
        accent: "#ff9900",
      },
    },
  },
  plugins: [],
};