import { CSPostHogProvider } from "@/components/providers/posthog";
import { ReactQueryProvider } from "@/components/react-query-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata, Viewport } from "next";
import dynamic from "next/dynamic";
import NextTopLoader from "nextjs-toploader";
import { geistMono, geistSans, montserrat, oswald, raleway } from "./fonts";
import "./globals.css";
import "./markdown-editor.css"; // Add this line

const PostHogPageView = dynamic(
  () => import("../components/posthog-pageview"),
  {
    ssr: false,
  }
);

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "MockMate – AI-Powered Interview Practice for Job Success",
  description:
    "Prepare for interviews with AI-driven mock sessions tailored to your role and industry. Build confidence and sharpen your skills with personalized, conversational practice. Start with a free trial!",
  keywords: [
    "MockMate",
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
    title: "MockMate – AI-Powered Interview Practice for Job Success",
    description:
      "Boost your interview skills with MockMate, the AI-powered mock interview tool designed to build your confidence. Get personalized practice tailored to your job and industry.",
    url: "https://www.mockmate.com", // Replace with your actual domain
    siteName: "MockMate",
    images: [
      {
        url: "https://mockmate.com/api/og", // Update with your OG image URL
        width: 1200,
        height: 630,
        alt: "MockMate App",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MockMate – AI-Powered Interview Practice for Job Success",
    description:
      "Get AI-powered, conversational interview practice tailored to your career goals. MockMate helps you prepare for success!",
    images: ["https://mockmate.com/api/og"],
    site: "@mockmateapp",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://www.mockmate.com",
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
    <ClerkProvider>
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
                <PostHogPageView />
                {children}
              </ThemeProvider>
              <SpeedInsights />
              <Analytics />

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
