import { ClerkProvider } from "@clerk/nextjs";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata, Viewport } from "next";
import NextTopLoader from "nextjs-toploader";
import { Suspense } from "react";
import { CSRFProvider } from "@/components/csrf-provider";
import PostHogPageView from "@/components/posthog-pageview";
import { CSPostHogProvider } from "@/components/providers/posthog";
import { ReactQueryProvider } from "@/components/react-query-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import { geistMono, geistSans, montserrat, oswald, raleway } from "./fonts";
import "./globals.css";
import "./markdown-editor.css"; // Add this line

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Interview Optimiser – The AI-Powered, Real-Time Interview Practice Tool",
  description:
    "Experience real, voice-to-voice interview practice with AI that adapts to your responses. Build confidence, enhance your delivery, and refine your skills with real-time feedback on prosody, confidence, and clarity. Start your journey with a free trial today!",
  keywords: [
    "Interview Optimiser",
    "real-time mock interview",
    "AI interview practice",
    "AI interview prep tool",
    "adaptive interview simulator",
    "interview preparation",
    "prosody analysis",
    "AI-driven interview tool",
    "mock interview platform",
    "personalized interview feedback",
    "interactive interview practice",
    "emotional analysis interview",
    "behavioral interview prep",
    "voice-to-voice interview practice",
    "career growth tools",
    "interview coaching",
  ],
  openGraph: {
    title: "Interview Optimiser – The AI-Powered, Real-Time Interview Practice Tool",
    description:
      "Elevate your interview skills with Interview Optimiser, the only mock interview tool offering real-time, voice-to-voice interaction. Experience adaptive, conversational AI that provides instant feedback on delivery, confidence, and vocal tone.",
    url: "https://www.interviewoptimiser.com",
    siteName: "Interview Optimiser",
    images: [
      {
        url: "https://interviewoptimiser.com/api/og",
        width: 1200,
        height: 630,
        alt: "Interview Optimiser App",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Interview Optimiser – The AI-Powered, Real-Time Interview Practice Tool",
    description:
      "Gain confidence and skills with real-time, voice-based AI interview practice that adjusts to your responses. Perfect for anyone aiming for job interview success.",
    images: ["https://interviewoptimiser.com/api/og"],
    site: "@bhekanik",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://www.interviewoptimiser.com",
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      {
        url: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.ico",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <ClerkProvider
        publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "pk_test_JA=="}
        dynamic
      >
        <body
          suppressHydrationWarning
          className={cn(
            "antialiased bg-background text-foreground",
            geistMono.variable,
            geistSans.variable,
            oswald.variable,
            montserrat.variable,
            raleway.variable
          )}
        >
          <ReactQueryProvider>
            <CSPostHogProvider>
              <CSRFProvider>
                <ThemeProvider
                  attribute="class"
                  defaultTheme="system"
                  enableSystem
                  disableTransitionOnChange
                >
                  <NextTopLoader />
                  <Suspense fallback={null}>
                    <ClerkProvider dynamic>
                      <PostHogPageView />
                    </ClerkProvider>
                  </Suspense>
                  {/* <ConditionalBlackFridayBanner /> */}
                  <main className="min-h-screen flex flex-col p-[env(safe-area-inset-top,1.25rem)_env(safe-area-inset-right,1.25rem)_env(safe-area-inset-bottom,1.25rem)_env(safe-area-inset-left,1.25rem)]">
                    {children}
                  </main>
                </ThemeProvider>
              </CSRFProvider>
              <SpeedInsights />
            </CSPostHogProvider>
          </ReactQueryProvider>
        </body>
      </ClerkProvider>
    </html>
  );
}
