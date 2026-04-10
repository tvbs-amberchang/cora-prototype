/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    screens: {
      sm: '479px',
      md: '768px',
      lg: '992px',
      xl: '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        brand: {
          50: '#eaf2ff',
          100: '#d6e6ff',
          200: '#b7d3ff',
          300: '#8bb9ff',
          400: '#3b89ff',
          500: '#146ef5',
          600: '#0055d4',
          700: '#006acc',
          800: '#004fa3',
          900: '#08357a',
          950: '#061f44',
        },
        accent: {
          50: '#f5f2ff',
          100: '#ece3ff',
          200: '#dac9ff',
          300: '#b794ff',
          400: '#7a3dff',
          500: '#ed52cb',
          600: '#ff6b00',
        },
        surface: {
          0: '#ffffff',
          50: '#ffffff',
          100: '#f7f7f7',
        },
        wf: {
          black: '#080808',
          gray: '#5a5a5a',
          border: '#d8d8d8',
          green: '#00d722',
          yellow: '#ffae13',
          red: '#ee1d36',
        },
      },
      fontFamily: {
        sans: ['"WF Visual Sans Variable"', 'Inter', 'Noto Sans TC', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 84px 24px rgba(0, 0, 0, 0), 0 54px 22px rgba(0, 0, 0, 0.01), 0 30px 18px rgba(0, 0, 0, 0.04), 0 13px 13px rgba(0, 0, 0, 0.08), 0 3px 7px rgba(0, 0, 0, 0.09)',
        'card-hover': '0 84px 24px rgba(0, 0, 0, 0), 0 54px 22px rgba(0, 0, 0, 0.015), 0 30px 18px rgba(0, 0, 0, 0.05), 0 13px 13px rgba(0, 0, 0, 0.1), 0 3px 7px rgba(0, 0, 0, 0.12)',
        'sidebar': '0 84px 24px rgba(0, 0, 0, 0), 0 54px 22px rgba(0, 0, 0, 0.01), 0 30px 18px rgba(0, 0, 0, 0.04), 0 13px 13px rgba(0, 0, 0, 0.08), 0 3px 7px rgba(0, 0, 0, 0.09)',
      },
      borderRadius: {
        'xl': '8px',
        '2xl': '8px',
      },
      transitionDuration: {
        '250': '250ms',
      },
    },
  },
  plugins: [],
};
