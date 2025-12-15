import animate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ["Inter", "system-ui", "sans-serif"],
            },
            colors: {
                // EDUmind Brand Colors
                mint: "var(--mint)",
                sky: "var(--sky)",
                vio: "var(--vio)",
                ink: "var(--ink)",
                sub: "var(--sub)",

                lme: {
                    primary: "var(--lme-primary)",
                    "primary-dark": "var(--lme-primary-dark)",
                    secondary: "var(--lme-secondary)",
                    accent: "var(--lme-accent)",
                    success: "var(--lme-success)",
                    warning: "var(--lme-warning)",
                    danger: "var(--lme-danger)",
                    "bg-start": "var(--lme-bg-start)",
                    "bg-end": "var(--lme-bg-end)",
                    surface: "var(--lme-surface)",
                    "surface-soft": "var(--lme-surface-soft)",
                    border: "var(--lme-border)",
                    text: "var(--lme-text)",
                    muted: "var(--lme-muted)",
                },
                edufis: {
                    "mental-start": "var(--edufis-mental-start)",
                    "mental-end": "var(--edufis-mental-end)",
                    "fisico-start": "var(--edufis-fisico-start)",
                    "fisico-end": "var(--edufis-fisico-end)",
                    "interior-start": "var(--edufis-interior-start)",
                    "interior-end": "var(--edufis-interior-end)",
                },
                // shadcn/ui compatibility
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
            },
            borderRadius: {
                xl: "var(--lme-radius-xl)",
                lg: "var(--lme-radius-lg)",
                md: "var(--lme-radius-md)",
                sm: "var(--lme-radius-sm)",
            },
            boxShadow: {
                "lme": "var(--lme-shadow)",
                "glass": "0 24px 46px rgba(4, 10, 28, .55)",
            },
            backdropBlur: {
                "glass": "18px",
            },
            animation: {
                "fade-in": "fadeIn 0.4s ease-out",
                "slide-up": "slideUp 0.4s ease-out",
            },
            keyframes: {
                fadeIn: {
                    "0%": { opacity: "0", transform: "translateY(10px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                slideUp: {
                    "0%": { opacity: "0", transform: "translateY(20px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
            },
        },
    },
    plugins: [animate],
}
