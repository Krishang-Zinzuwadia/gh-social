/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        sans: ["NataSans-Regular", "sans-serif"],
        nata: ["NataSans-Regular"],
        nataSemiBold: ["NataSans-SemiBold"],
        nataBold: ["NataSans-Bold"],
        noto: ["NotoSans_400Regular", "sans-serif"],
        "noto-bold": ["NotoSans_700Bold", "sans-serif"],
      },
    },
  },
  plugins: [],
};