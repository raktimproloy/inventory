import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
       dark: '#101828',
        primary: '#DC5326',
        'primary-light': '#FEEFEA',
        gray: '#344054'
      },
    },
    container: {
      center: true,
      padding: '15px',
    },
    screens: {
      'sm': '640px',

      'md': '768px',

      'lg': '1024px',

      'xl': '1280px',

      '2xl': '1440px',
    },
  },

  plugins: [
  ],
} satisfies Config;
