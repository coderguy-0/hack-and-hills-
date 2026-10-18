/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#060A14",
        slate: { 900: "#0B1222", 800: "#101A33" },
        amber: { glow: "#F59E0B" },
        ice: "#38BDF8",
        summit: "#E2E8F0"
      },
      fontFamily: {
        display: ["Space Grotesk", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"]
      },
      boxShadow: {
        glow: "0 0 40px rgba(245,158,11,0.25)",
        card: "0 8px 32px rgba(0,0,0,0.4)"
      }
    }
  },
  plugins: []
}
