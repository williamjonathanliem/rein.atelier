import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        pastel: {
          lavender: '#ede9fe',
          purple: '#a78bfa',
          blush: '#fce7f3',
          pink: '#f9a8d4',
          sage: '#d1fae5',
          green: '#6ee7b7',
          peach: '#ffedd5',
          amber: '#fcd34d',
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      fontFamily: {
        sans: ['Instrument Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
