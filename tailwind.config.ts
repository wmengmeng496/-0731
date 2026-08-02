export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          mystical: {
            50: '#fdf8f0',
            100: '#f9ecd8',
            200: '#f2d5a8',
            300: '#e9b870',
            400: '#df9940',
            500: '#c97a1f',
            600: '#a86017',
            700: '#7d4614',
            800: '#5a3414',
            900: '#3b2310',
          },
          deep: {
            50: '#f5f3ef',
            100: '#e8e3d9',
            200: '#d4cbb8',
            300: '#b8a88e',
            400: '#a38d6e',
            500: '#8f7554',
            600: '#745e43',
            700: '#5a4735',
            800: '#3d2f23',
            900: '#1f1711',
            950: '#0f0b08',
          },
        },
        fontFamily: {
          display: ['"Noto Serif SC"', 'serif'],
          body: ['"Noto Sans SC"', 'sans-serif'],
        },
      },
    },
    plugins: [],
  }