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
        deal: {
          bg: "#0b0d17",
          card: "#161b2c",
          border: "#1e2540",
          muted: "#8b95b0",
          accent: "#8b5cf6",
          green: "#22c55e",
          red: "#ef4444",
          blue: "#3b82f6",
        },
        quelliv: {
          white: "#FFFFFF",
          section: "#F0F4F8",
          navy: "#0A2D61",
          cta: "#709BFF",
          muted: "#666666",
          border: "#E2E8F0",
        },
      },
      fontFamily: {
        sans: ["var(--font-montserrat)", "Montserrat", "ui-sans-serif", "system-ui", "sans-serif"],
        brand: ["var(--font-brand)", "Great Vibes", "cursive"],
      },
      boxShadow: {
        cta: "0 8px 24px rgba(112, 155, 255, 0.35)",
        panel: "0 20px 50px rgba(10, 45, 97, 0.18)",
      },
    },
  },
  plugins: [],
};
export default config;
