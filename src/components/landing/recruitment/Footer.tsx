import {
  COPYRIGHT_TEXT,
  FOOTER_LINKS,
  NAVIGATION_LINKS,
  SOCIAL_LINKS,
} from "@/lib/landing/recruitment/constants";
import { cn } from "@/lib/utils";
import { LinkedinIcon, TwitterIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { config } from "~/config";

// Define type for navigation links if not already globally available
interface NavLink {
  label: string;
  href: string;
}

export default function Footer() {
  return (
    <footer className="relative w-full border-t border-primary/20 bg-primary/95 text-primary-foreground">
      {/* Background pattern overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />

      <div className="container relative z-10 mx-auto px-4 py-12 md:px-6 lg:py-16 max-w-7xl">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: About/Logo */}
          <div className="space-y-4">
            <Link href="/" className={cn("flex items-center gap-3 text-2xl font-bold group")}>
              <div className="relative transition-transform duration-300 group-hover:scale-105">
                <Image
                  src="/logo.png"
                  alt="Interview Optimiser Logo"
                  width={48}
                  height={48}
                  className="rounded-lg shadow-md"
                />
              </div>
              <span className="text-primary-foreground">Interview Optimiser</span>
            </Link>
            <p className="text-style-body-small text-primary-foreground/80 leading-relaxed max-w-xs">
              Revolutionising interview preparation and hiring with AI.
            </p>
          </div>

          {/* Column 2: Company Links */}
          <div className="space-y-4">
            <h3 className="text-style-h4 text-primary-foreground font-medium">Company</h3>
            <ul className="space-y-3">
              {NAVIGATION_LINKS.map((link: NavLink) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-style-body-small text-primary-foreground/70 hover:text-primary-foreground transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Legal Links */}
          <div className="space-y-4">
            <h3 className="text-style-h4 text-primary-foreground font-medium">Legal</h3>
            <ul className="space-y-3">
              {FOOTER_LINKS.filter((link) => !["Documentation"].includes(link.label)).map(
                (link: NavLink) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-style-body-small text-primary-foreground/70 hover:text-primary-foreground transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Column 4: Social & Contact */}
          <div className="space-y-4">
            <h3 className="text-style-h4 text-primary-foreground font-medium">Connect With Us</h3>
            <div className="flex space-x-4">
              {SOCIAL_LINKS.linkedin && (
                <Link
                  href={SOCIAL_LINKS.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10 p-2 rounded-full transition-all duration-200"
                  aria-label="LinkedIn"
                >
                  <LinkedinIcon className="h-6 w-6" />
                </Link>
              )}
              {SOCIAL_LINKS.twitter && (
                <Link
                  href={SOCIAL_LINKS.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10 p-2 rounded-full transition-all duration-200"
                  aria-label="Twitter"
                >
                  <TwitterIcon className="h-6 w-6" />
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Copyright Bar */}
        <div className="mt-12 border-t border-primary-foreground/10 py-8">
          <p className="text-style-caption text-primary-foreground/60 text-center">
            {COPYRIGHT_TEXT ||
              `© ${new Date().getFullYear()} ${config.projectName}. All rights reserved.`}
          </p>
        </div>
      </div>
    </footer>
  );
}
