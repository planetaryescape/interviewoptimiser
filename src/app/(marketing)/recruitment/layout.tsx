import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { config } from "../../../../config";

import Footer from "@/components/landing/recruitment/Footer";
// Components will be created in subsequent steps
import NavigationBar from "@/components/landing/recruitment/NavigationBar";

// Choose primary font for the page
const fontSans = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: `AI-Powered Interview Optimisation | ${config.projectName}`,
  description: `Revolutionise your hiring with AI-driven interviews. Scale your screening, cut hiring time, and discover top talent with ${config.projectName}.`,
  keywords:
    "AI interview, recruitment AI, candidate screening, hiring automation, interview practice, talent acquisition, B2B hiring solutions",
  metadataBase: new URL(config.baseUrl),
  openGraph: {
    title: `AI-Powered Interview Optimisation | ${config.projectName}`,
    description: "Scale your screening, cut hiring time, and discover top talent.",
    url: `${config.baseUrl}/recruitment`,
    siteName: config.projectName,
    // images: [{ url: `${config.baseUrl}/og-recruitment.jpg`, width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `AI-Powered Interview Optimisation | ${config.projectName}`,
    description: "Revolutionise your hiring with AI-driven interviews.",
    // images: [`${config.baseUrl}/twitter-recruitment.jpg`],
  },
  // alternates: {
  //   canonical: `${config.baseUrl}/recruitment`,
  // },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "hsl(30, 20%, 96%)" },
    { media: "(prefers-color-scheme: dark)", color: "hsl(220, 15%, 10%)" },
  ],
};

export default function RecruitmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // This layout assumes ThemeProvider is in a higher-level root layout
    <div className={`flex flex-col min-h-screen ${fontSans.variable} font-sans antialiased`}>
      <NavigationBar />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}
