/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}", "./context/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors:{ primary:"#00BCD4", primaryDark:"#00ACC1", dark:"#1a1a2e", light:"#f5f7fa", muted:"#666" },
      borderRadius:{ xl:"12px" }
    }
  },
  plugins:[]
};
