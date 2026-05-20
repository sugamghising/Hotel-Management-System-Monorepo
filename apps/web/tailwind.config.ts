import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/app/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // shadcn base (required)
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
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },

        // HMS status colors — these are used EVERYWHERE
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
        task: {
          pending: "#f59e0b",
          "in-progress": "#3b82f6",
          completed: "#10b981",
          verified: "#6b7280",
          cancelled: "#ef4444",
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
      fontFamily: {
        sans: ["var(--font-geist-sans)", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
