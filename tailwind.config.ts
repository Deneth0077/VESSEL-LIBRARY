import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f5fa',
          100: '#dbe5f0',
          200: '#b8ccdf',
          300: '#8cae Basic',
          400: '#406182',
          500: '#10395b',
          600: '#002b49',
          700: '#001d34',
          800: '#001629',
          900: '#000d1a',
        },
        ocean: {
          50: '#ecf7ff',
          100: '#c7e7ff',
          200: '#8ed1fd',
          500: '#10658c',
          600: '#005a80',
          700: '#004c6c',
          800: '#003a54',
        },
        teal: {
          500: '#00a479',
          600: '#008561',
        },
        surface: {
          DEFAULT: '#f6faff',
          dim: '#d2dbe4',
          bright: '#f6faff',
          container: '#e6eff8',
          card: '#ffffff',
          variant: '#dbe4ed',
        },
        outline: {
          DEFAULT: '#73777e',
          variant: '#c3c7ce',
        }
      },
      fontFamily: {
        sans: ['Public Sans', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,22,41,0.05), 0 1px 2px rgba(0,22,41,0.03)',
        modal: '0 8px 30px rgba(0, 22, 41, 0.16)',
        dropdown: '0 4px 16px rgba(0, 22, 41, 0.1)',
      },
    },
  },
  plugins: [],
};

export default config;
