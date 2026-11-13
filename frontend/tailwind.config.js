/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        serko: {
          ink: '#17181c',
          navy: '#001c38',
          soft: '#4b4f57',
          muted: '#8a8d96',
          bg: '#ffffff',
          alabaster: '#f6f6f6',
          ice: '#e8f3fe',
          'ice-deep': '#cfe6fc',
          pill: '#f1f1f3',
          border: '#e9e9ec',
          blue: '#1b98f2',
          'blue-dark': '#0078d4',
          green: '#1b9e52',
          'green-ink': '#146b3a',
          'green-bg': '#e2f8ea',
          'green-border': '#c7f0d7',
          coral: '#ff635c',
          orange: '#ff8c51',
          pink: '#f56293',
          purple: '#cf69e0',
        },
      },
      fontFamily: {
        sans: ['"Be Vietnam Pro"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Be Vietnam Pro"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2.5rem',
      },
      boxShadow: {
        'serko-nav': '0 8px 30px rgba(0, 28, 56, 0.06)',
        'serko-card': '0 18px 45px -18px rgba(0, 28, 56, 0.12), 0 1px 3px rgba(0, 0, 0, 0.04)',
        'serko-float': '0 22px 60px -15px rgba(0, 28, 56, 0.16), 0 2px 6px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
};
