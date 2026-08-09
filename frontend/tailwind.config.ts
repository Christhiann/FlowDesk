import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f2f5ff',
          100: '#e6ebff',
          500: '#4f5bd5',
          600: '#3f49b8',
          700: '#333c96',
        },
      },
    },
  },
  plugins: [],
};
export default config;
