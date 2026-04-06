/** @type {import('tailwindcss').Config} */
import typography from '@tailwindcss/typography';
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: {} },
  plugins: [
    typography,
    require('@tailwindcss/typography'),
  ],
};