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
    <footer className="relative w-full border-t border-border/20 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4 py-12 md:px-6 lg:py-16 max-w-7xl">
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
                  className="rounded-lg shadow-sm"
                />
              </div>
              <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Interview Optimiser
              </span>
            </Link>
            <p className="text-style-body-small text-muted-foreground leading-relaxed max-w-xs">
              Revolutionising interview preparation and hiring with AI.
            </p>
          </div>

          {/* Column 2: Company Links */}
          <div className="space-y-4">
            <h3 className="text-style-h4 text-foreground">Company</h3>
            <ul className="space-y-3">
              {NAVIGATION_LINKS.map((link: NavLink) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-style-body-small text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Legal Links */}
          <div className="space-y-4">
            <h3 className="text-style-h4 text-foreground">Legal</h3>
            <ul className="space-y-3">
              {FOOTER_LINKS.filter((link) => !["Documentation"].includes(link.label)).map(
                (link: NavLink) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-style-body-small text-muted-foreground hover:text-foreground transition-colors duration-200"
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
            <h3 className="text-style-h4 text-foreground">Connect With Us</h3>
            <div className="flex space-x-4">
              {SOCIAL_LINKS.linkedin && (
                <Link
                  href={SOCIAL_LINKS.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors duration-200"
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
                  className="text-muted-foreground hover:text-foreground transition-colors duration-200"
                  aria-label="Twitter"
                >
                  <TwitterIcon className="h-6 w-6" />
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Copyright Bar */}
        <div className="mt-12 border-t border-border/20 py-8">
          <p className="text-style-caption text-muted-foreground text-center">
            {COPYRIGHT_TEXT ||
              `© ${new Date().getFullYear()} ${config.projectName}. All rights reserved.`}
          </p>
        </div>
      </div>
    </footer>
  );
}
