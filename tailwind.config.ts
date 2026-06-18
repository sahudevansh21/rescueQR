import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        vlink: {
          pulse: "#FF5A4E",
          "pulse-dim": "rgba(255, 90, 78, 0.1)",
          trust: "#1C5C53",
          "trust-deep": "#11332D",
          ink: "#15201D",
          "ink-soft": "#4B5A56",
          paper: "#F1F4EE",
          line: "#D9DFD6",
          success: "#3F7D5C"
        }
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        sans: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"]
      }
    },
  },
  plugins: [],
}
export default config
