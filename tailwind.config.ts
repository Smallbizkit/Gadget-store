import type { Config } from "tailwindcss";

// Design language: "diagnostic readout" — premium electronics retail,
// specs and prices rendered like data off a device's own display.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0B0F14", // near-black base, cooler than pure black
          soft: "#111820",
        },
        panel: "#161E27", // card surfaces
        titanium: "#EDEEEE", // primary light text / light-mode surface
        silver: "#9AA5B1", // secondary text, muted
        signal: {
          DEFAULT: "#39D9C7", // phosphor-cyan accent — the one accent color
          dim: "#1F8F84",
        },
        line: "#232C36", // hairline dividers
      },
      fontFamily: {
        display: ["var(--font-space-grotesk)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      borderRadius: {
        card: "10px",
      },
      backgroundImage: {
        scanline:
          "repeating-linear-gradient(0deg, rgba(57,217,199,0.04) 0px, rgba(57,217,199,0.04) 1px, transparent 1px, transparent 3px)",
      },
    },
  },
  plugins: [],
};

export default config;
