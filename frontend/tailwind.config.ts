import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        fusion: {
          bg: "#f8faff",
          panel: "#ffffff",
          panelSoft: "#f4f1ff",
          text: "#0a1230",
          muted: "#647091",
          line: "#e0e6f2",
          purple: "#5c3be0",
          purpleDark: "#3f2bc4",
          green: "#28a86f",
          amber: "#f0a12a",
          red: "#f05a5a",
          blue: "#4478e8",
        },
      },
      boxShadow: {
        fusion: "0 14px 36px rgba(45, 55, 95, 0.08)",
        fusionHover: "0 24px 80px rgba(45, 55, 95, 0.12)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
