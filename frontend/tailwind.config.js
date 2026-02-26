import defaultTheme from 'tailwindcss/defaultTheme'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", ...defaultTheme.fontFamily.sans],
      },
      colors: {
        primary: '#2563eb',
        'primary-dark': '#1e40af',
        secondary: '#64748b',
        success: '#16a34a',
        danger: '#dc2626',
        error: '#dc2626',
      },
    },
  },
  plugins: [],
}
