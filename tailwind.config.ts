import type { Config } from "tailwindcss";

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
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
};

export default config;
