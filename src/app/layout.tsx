import PostHogPageView from "@/components/posthog-pageview";
import { CSPostHogProvider } from "@/components/providers/posthog";
import { ReactQueryProvider } from "@/components/react-query-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import { ClerkProvider } from "@clerk/nextjs";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata, Viewport } from "next";
import NextTopLoader from "nextjs-toploader";
import { Suspense } from "react";
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
  title: "Interview Optimiser – AI-Powered Interview Practice for Job Success",
  description:
    "Prepare for interviews with AI-driven mock sessions tailored to your role and industry. Build confidence and sharpen your skills with personalized, conversational practice. Start with a free trial!",
  keywords: [
    "Interview Optimiser",
    "mock interview",
    "AI interview practice",
    "AI interview prep",
    "interview preparation tool",
    "AI interview simulator",
    "mock interviews",
    "interview skills",
    "job interview practice",
    "personalized interview practice",
    "conversational interview practice",
    "behavioral interview",
    "situational interview",
    "AI mock interview",
    "career development tool",
    "interview feedback",
    "AI-driven interview prep",
  ],
  openGraph: {
    title:
      "Interview Optimiser – AI-Powered Interview Practice for Job Success",
    description:
      "Boost your interview skills with Interview Optimiser, the AI-powered mock interview tool designed to build your confidence. Get personalized practice tailored to your job and industry.",
    url: "https://www.interviewoptimiser.com", // Replace with your actual domain
    siteName: "Interview Optimiser",
    images: [
      {
        url: "https://interviewoptimiser.com/api/og", // Update with your OG image URL
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
    title:
      "Interview Optimiser – AI-Powered Interview Practice for Job Success",
    description:
      "Get AI-powered, conversational interview practice tailored to your career goals. Interview Optimiser helps you prepare for success!",
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
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "no-key"}
    >
      <html
        className="size-screen overflow-hidden"
        lang="en"
        suppressHydrationWarning
      >
        <ReactQueryProvider>
          <CSPostHogProvider>
            <body
              suppressHydrationWarning
              className={cn(
                `antialiased size-screen bg-background text-foreground overflow-auto`,
                geistMono.variable,
                geistSans.variable,
                oswald.variable,
                montserrat.variable,
                raleway.variable
              )}
            >
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
                {children}
              </ThemeProvider>
              <SpeedInsights />

              <script
                async
                src="https://js.stripe.com/v3/pricing-table.js"
              ></script>
            </body>
          </CSPostHogProvider>
        </ReactQueryProvider>
      </html>
    </ClerkProvider>
  );
}
