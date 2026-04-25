/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef7f1',
          100: '#d4ebdd',
          200: '#aed8c0',
          300: '#84c39f',
          400: '#4ca177',
          500: '#1a6b3c',
          600: '#145832',
          700: '#0f4528',
          800: '#0a331d',
          900: '#052112',
        },
        accent: {
          100: '#fff7d6',
          300: '#f9e27e',
          500: '#d7ac20',
          700: '#9f7d11',
        },
      },
      boxShadow: {
        soft: '0 8px 24px rgba(15, 23, 42, 0.06)',
      },
    },
  },
  plugins: [],
}
