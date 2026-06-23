import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#102033",
        panel: "#f6faff",
        line: "#d7e4f0",
        moss: "#00876f",
        clay: "#ff6b35",
        steel: "#4056d6",
        mint: "#d8fff0",
        wheat: "#fff3bf",
        coral: "#ff5c7a",
        sky: "#d9f0ff",
        violet: "#eee7ff"
      },
      boxShadow: {
        soft: "0 20px 60px rgba(16, 32, 51, 0.1)"
      }
    }
  },
  plugins: []
};

export default config;
