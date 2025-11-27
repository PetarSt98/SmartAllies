/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#fa5b35',
          foreground: '#ffffff',
        },
      },
    },
  },
  plugins: [],
}
