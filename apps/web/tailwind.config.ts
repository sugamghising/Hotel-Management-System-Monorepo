import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/app/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          bg: "#0f172a",
          hover: "#1e293b",
          active: "#1d4ed8",
          text: "#cbd5e1",
          "text-muted": "#64748b",
          border: "#1e293b",
        },
        // HMS status colors
        room: {
          "vacant-clean": "#16a34a",
          "vacant-dirty": "#ca8a04",
          "vacant-cleaning": "#2563eb",
          "occupied-clean": "#0891b2",
          "occupied-dirty": "#dc2626",
          "occupied-cleaning": "#7c3aed",
          "out-of-order": "#9f1239",
          reserved: "#6366f1",
          blocked: "#6b7280",
        },
        reservation: {
          pending: "#f59e0b",
          confirmed: "#3b82f6",
          "checked-in": "#10b981",
          "checked-out": "#6b7280",
          cancelled: "#ef4444",
          "no-show": "#f97316",
          waitlist: "#8b5cf6",
        },
        priority: {
          low: "#6b7280",
          medium: "#f59e0b",
          high: "#ef4444",
          urgent: "#dc2626",
          emergency: "#9f1239",
        },
        vip: {
          none: "#6b7280",
          bronze: "#92400e",
          silver: "#64748b",
          gold: "#ca8a04",
          platinum: "#475569",
          black: "#0f172a",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.15s ease-out",
        float: "float 3s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
