import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#1b4965",
          dark: "#0f2e42",
          light: "#5fa8d3",
        },
      },
    },
  },
  plugins: [],
};

export default config;
