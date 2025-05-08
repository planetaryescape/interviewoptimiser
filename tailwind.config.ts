import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        aller: ["var(--font-aller)", "sans-serif"],
        arial: ["Arial", "sans-serif"],
        bebasKai: ["var(--font-bebas-kai)", "sans-serif"],
        bebasNeue: ["var(--font-bebas-neue)", "sans-serif"],
        butler: ["var(--font-butler)", "serif"],
        calibri: ["Calibri", "sans-serif"],
        comfortaa: ["var(--font-comfortaa)", "cursive"],
        crimsonText: ["var(--font-crimson-text)", "serif"],
        exo: ["var(--font-exo)", "sans-serif"],
        firaCode: ["var(--font-fira-code)", "monospace"],
        firaSans: ["var(--font-fira-sans)", "sans-serif"],
        helvetica: ["Helvetica", "Arial", "sans-serif"],
        ibmPlexSans: ["var(--font-ibm-plex-sans)", "sans-serif"],
        jetbrainsMono: ["var(--font-jetbrains-mono)", "monospace"],
        kelsonSans: ["var(--font-kelson-sans)", "sans-serif"],
        lato: ["var(--font-lato)", "sans-serif"],
        lora: ["var(--font-lora)", "serif"],
        merriweather: ["var(--font-merriweather)", "serif"],
        montserrat: ["var(--font-montserrat)", "sans-serif"],
        nunito: ["var(--font-nunito)", "sans-serif"],
        openSans: ["var(--font-open-sans)", "sans-serif"],
        oswald: ["var(--font-oswald)", "sans-serif"],
        playfairDisplay: ["var(--font-playfair-display)", "serif"],
        raleway: ["var(--font-raleway)", "sans-serif"],
        roboto: ["var(--font-roboto)", "sans-serif"],
        robotoMono: ["var(--font-roboto-mono)", "monospace"],
        rubik: ["var(--font-rubik)", "sans-serif"],
        sourceSansPro: ["var(--font-source-sans-pro)", "sans-serif"],
        sourceSerif: ["var(--font-source-serif)", "serif"],
        ubuntu: ["var(--font-ubuntu)", "sans-serif"],
        workSans: ["var(--font-work-sans)", "sans-serif"],
        geistSans: ["var(--font-geist-sans)", "sans-serif"],
        geistMono: ["var(--font-geist-mono)", "monospace"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-geist-sans)", "Helvetica", "Arial", "sans-serif"],
        headingPrimary: ["var(--font-oswald)", "Impact", "sans-serif"],
        headingSecondary: ["var(--font-montserrat)", "Helvetica", "Arial", "sans-serif"],
      },
      fontSize: {
        xs: ["0.875rem", { lineHeight: "1.25rem" }],
        sm: ["1rem", { lineHeight: "1.5rem" }],
        base: ["1.125rem", { lineHeight: "1.75rem" }],
        lg: ["1.25rem", { lineHeight: "1.75rem" }],
        xl: ["1.5rem", { lineHeight: "2rem" }],
        "2xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "3xl": ["2.25rem", { lineHeight: "2.5rem" }],
        "4xl": ["3rem", { lineHeight: "1.2" }],
        "5xl": ["3.75rem", { lineHeight: "1.15" }],
        "6xl": ["4.5rem", { lineHeight: "1.1" }],
        "7xl": ["5.625rem", { lineHeight: "1.05" }],
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
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
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
          "6": "hsl(var(--chart-6))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        breathe: {
          "0%, 100%": {
            opacity: "1",
          },
          "50%": {
            opacity: "0.5",
          },
        },
        meteor: {
          "0%": {
            transform: "rotate(215deg) translateX(0)",
            opacity: "1",
          },
          "70%": {
            opacity: "1",
          },
          "100%": {
            transform: "rotate(215deg) translateX(-500px)",
            opacity: "0",
          },
        },
        buttonheartbeat: {
          "0%": {
            "box-shadow": '0 0 0 0 theme("colors.primary.DEFAULT")',
            transform: "scale(1)",
          },
          "50%": {
            "box-shadow": '0 0 0 7px theme("colors.primary.DEFAULT/0")',
            transform: "scale(1.05)",
          },
          "100%": {
            "box-shadow": '0 0 0 0 theme("colors.primary.DEFAULT/0")',
            transform: "scale(1)",
          },
        },
        "border-beam": {
          "100%": {
            "offset-distance": "100%",
          },
        },
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        breathe: "breathe 2s ease-in-out infinite",
        "meteor-effect": "meteor 5s linear infinite",
        buttonheartbeat: "buttonheartbeat 2s infinite ease-in-out",
        "border-beam": "border-beam calc(var(--duration)*1s) infinite linear",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      backgroundImage: {
        "custom-gradient": "var(--gradient)",
      },
      spacing: {
        baseline: "4px",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography"),
    plugin(({ addComponents, theme }) => {
      addComponents({
        ".text-style-display": {
          fontFamily: theme("fontFamily.headingPrimary"),
          fontSize: theme("fontSize.5xl"),
          fontWeight: theme("fontWeight.bold"),
          lineHeight: "1.05",
          letterSpacing: theme("letterSpacing.tight"),
          "@screen sm": {
            fontSize: theme("fontSize.6xl"),
          },
          "@screen lg": {
            fontSize: theme("fontSize.7xl"),
          },
        },
        ".text-style-h1": {
          fontFamily: theme("fontFamily.headingPrimary"),
          fontSize: theme("fontSize.3xl"),
          fontWeight: theme("fontWeight.bold"),
          lineHeight: "1.2",
          letterSpacing: theme("letterSpacing.tight"),
          "@screen sm": {
            fontSize: theme("fontSize.4xl"),
          },
          "@screen lg": {
            fontSize: theme("fontSize.5xl"),
          },
        },
        ".text-style-h2": {
          fontFamily: theme("fontFamily.headingPrimary"),
          fontSize: theme("fontSize.2xl"),
          fontWeight: theme("fontWeight.semibold"),
          lineHeight: "1.25",
          letterSpacing: theme("letterSpacing.tight"),
          "@screen sm": {
            fontSize: theme("fontSize.3xl"),
          },
          "@screen lg": {
            fontSize: theme("fontSize.4xl"),
          },
        },
        ".text-style-h3": {
          fontFamily: theme("fontFamily.headingSecondary"),
          fontSize: theme("fontSize.xl"),
          fontWeight: theme("fontWeight.semibold"),
          lineHeight: "1.3",
          "@screen sm": {
            fontSize: theme("fontSize.2xl"),
          },
          "@screen lg": {
            fontSize: theme("fontSize.3xl"),
          },
        },
        ".text-style-h4": {
          fontFamily: theme("fontFamily.headingSecondary"),
          fontSize: theme("fontSize.lg"),
          fontWeight: theme("fontWeight.semibold"),
          lineHeight: "1.35",
          "@screen sm": {
            fontSize: theme("fontSize.xl"),
          },
          "@screen lg": {
            fontSize: theme("fontSize.2xl"),
          },
        },
        ".text-style-body-lead": {
          fontFamily: theme("fontFamily.sans"),
          fontSize: theme("fontSize.lg"),
          fontWeight: theme("fontWeight.normal"),
          lineHeight: "1.65",
        },
        ".text-style-body-base": {
          fontFamily: theme("fontFamily.sans"),
          fontSize: theme("fontSize.base"),
          fontWeight: theme("fontWeight.normal"),
          lineHeight: "1.7",
        },
        ".text-style-body-small": {
          fontFamily: theme("fontFamily.sans"),
          fontSize: theme("fontSize.sm"),
          fontWeight: theme("fontWeight.normal"),
          lineHeight: "1.6",
        },
        ".text-style-caption": {
          fontFamily: theme("fontFamily.sans"),
          fontSize: theme("fontSize.xs"),
          fontWeight: theme("fontWeight.normal"),
          lineHeight: "1.5",
        },
      });
    }),
  ],
};

export default config;
