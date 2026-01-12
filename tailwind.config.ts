import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    screens: {
      'xs': '320px',
      'sm': '375px',
      'md': '425px',
      'lg': '768px',
      'xl': '1024px',
      '2xl': '1280px',
    },
    extend: {
      colors: {
        'accent-red': '#DC2626',
        'dark-accent': '#374151',
        'text-secondary': '#6B7280',
        'text-muted': '#9CA3AF',
        'neutral-bg': '#F9FAFB',
        'neutral-card': 'rgba(255,255,255,0.8)',
        'neutral-border': 'rgba(31,41,55,0.1)',
        'primary-teal': 'hsl(217 91% 60%)',
        'accent-green': 'hsl(160 84% 39%)',
        'accent-amber': 'hsl(24 95% 53%)',
        'accent-cyan': 'hsl(262 83% 58%)',
        // Landing (Unauthenticated) Theme
        landing: {
          background: "hsl(0 0% 98%)",
          foreground: "hsl(0 0% 0%)",
          primary: "hsl(217 91% 60%)",
          secondary: "hsl(0 0% 95%)",
          accent: "hsl(160 84% 39%)",
          glass: "rgba(255, 255, 255, 0.1)",
          "glass-border": "rgba(255, 255, 255, 0.2)",
        },
        // App (Authenticated) Theme
        app: {
          background: "hsl(0 0% 100%)",
          foreground: "hsl(210 25% 10%)",
          primary: "hsl(180 58% 39%)",
          secondary: "hsl(210 15% 95%)",
          accent: "hsl(160 84% 39%)",
          muted: "hsl(210 10% 96%)",
          border: "hsl(210 15% 90%)",
        },
        // Admin Theme
        admin: {
          background: "hsl(210 20% 98%)",
          foreground: "hsl(210 25% 10%)",
          primary: "hsl(180 58% 39%)",
          secondary: "hsl(210 10% 95%)",
          accent: "hsl(160 84% 39%)",
          muted: "hsl(210 10% 96%)",
          border: "hsl(210 15% 90%)",
        },
        // Dark Theme
        dark: {
          background: "hsl(210 25% 8%)",
          foreground: "hsl(210 40% 98%)",
          primary: "hsl(180 58% 39%)",
          secondary: "hsl(210 15% 15%)",
          accent: "hsl(160 84% 39%)",
          muted: "hsl(210 10% 15%)",
          border: "hsl(210 15% 20%)",
        },
        // Legacy support
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
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        status: {
          available: "hsl(var(--status-available))",
          busy: "hsl(var(--status-busy))",
          offline: "hsl(var(--status-offline))",
        },
      },
      borderRadius: {
        lg: "16px",
        md: "12px",
        sm: "8px",
        xl: "20px",
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Inter', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(31, 38, 135, 0.12)',
        'glass-hover': '0 12px 40px rgba(31, 38, 135, 0.15)',
        'soft': '0 4px 20px rgba(0, 0, 0, 0.08)',
        'soft-lg': '0 10px 40px rgba(0, 0, 0, 0.1)',
      },
      backdropBlur: {
        'glass': '16px',
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
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        shimmer: "shimmer 2s infinite",
        "fade-in": "fade-in 0.6s ease-out",
        "slide-up": "slide-up 0.8s ease-out",
        "scale-in": "scale-in 0.5s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
