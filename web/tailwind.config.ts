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
          DEFAULT: "#6d28d9",
          dark: "#4c1d95",
          light: "#a78bfa",
          ink: "#16141f",
        },
      },
    },
  },
  plugins: [],
};

export default config;
