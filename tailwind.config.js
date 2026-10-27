export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          50:  '#e0f7ff',
          100: '#b3ecff',
          200: '#66d9ff',
          300: '#1ac6ff',
          400: '#00b4f0',
          500: '#0099cc',
          600: '#007aa3',
          700: '#005c7a',
          800: '#003d52',
          900: '#001f29',
        },
        dark: {
          100: '#1a1a1f',
          200: '#141418',
          300: '#0f0f13',
          400: '#0a0a0d',
        }
      },
      fontFamily: {
        sans: ['Sora', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'accent-gradient': 'linear-gradient(135deg, #001f29 0%, #003d52 50%, #0099cc 100%)',
        'card-gradient': 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.8) 100%)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      }
    },
  },
  plugins: [],
}
