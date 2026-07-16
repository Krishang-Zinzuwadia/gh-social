/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        darkBg: '#000000',
        accentPrimary: '#63E08A',
        accentSecondary: '#63E08A',
        glowColor: 'rgba(99,224,138,0.35)',
      },
      fontFamily: {
        sans: ['NataSans-Regular', 'System'],
        medium: ['NataSans-Medium', 'System'],
        semibold: ['NataSans-SemiBold', 'System'],
        bold: ['NataSans-Bold', 'System'],
      },
    },
  },
  plugins: [],
};
