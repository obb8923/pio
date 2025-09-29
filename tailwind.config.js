/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        'p': ['Pretendard-Regular'],
        'p-semibold': ['Pretendard-SemiBold'],
        'p-extrabold': ['Pretendard-ExtraBold'],
        'p-black': ['Pretendard-Black'],
      },
      colors: {
        'white': '#fefefe',
        'black': '#191919',
        'svggray': '#6b7280',
        'svggray2': '#9ca3af',
        'svggray3': '#D1D5DB',
        'greenActive': '#ADFDAD',
        'greenInactive': '#6AE3D0',
        'greenTab': '#1C8597',
        'greenTab900': '#0C3941',
       


      },
    },
  },
  plugins: [],
}; 
