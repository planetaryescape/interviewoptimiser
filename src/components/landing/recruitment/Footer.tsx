import {
  COPYRIGHT_TEXT,
  FOOTER_LINKS,
  NAVIGATION_LINKS,
  SOCIAL_LINKS,
} from "@/lib/landing/recruitment/constants";
import { LinkedinIcon, TwitterIcon } from "lucide-react"; // Example icons
import Link from "next/link";

// Define type for navigation links if not already globally available
interface NavLink {
  label: string;
  href: string;
}

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto px-4 py-12 md:px-6 lg:py-16">
        <div className="grid gap-12 lg:grid-cols-3">
          {/* Column 1: About/Logo (Optional) */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              {/* <Image src='/logo.svg' alt='Interview Optimiser Logo' width={32} height={32} /> */}
              <span className="text-xl font-semibold text-foreground">Interview Optimiser</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Revolutionising interview preparation and hiring with AI.
            </p>
          </div>

          {/* Column 2: Links */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
                Company
              </h3>
              <ul className="mt-4 space-y-2">
                {NAVIGATION_LINKS.map((link: NavLink) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
                Legal
              </h3>
              <ul className="mt-4 space-y-2">
                {FOOTER_LINKS.filter((link) => !["Documentation"].includes(link.label)).map(
                  (link: NavLink) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>

          {/* Column 3: Social & Contact (Optional) */}
          <div className="space-y-4 md:col-span-2 lg:col-span-1 lg:justify-self-end">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Connect With Us
            </h3>
            <div className="flex space-x-4">
              {SOCIAL_LINKS.linkedin && (
                <Link
                  href={SOCIAL_LINKS.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground"
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
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Twitter"
                >
                  <TwitterIcon className="h-6 w-6" />
                </Link>
              )}
              {/* Add more social icons as needed */}
            </div>
            {/* Optional: Newsletter or contact info */}
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-8 text-center text-sm text-muted-foreground md:flex md:items-center md:justify-between">
          <p>{COPYRIGHT_TEXT}</p>
          {/* Optional: Secondary footer links */}
        </div>
      </div>
    </footer>
  );
}
