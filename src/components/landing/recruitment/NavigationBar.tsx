"use client";

import { ClerkProvider, SignedIn, UserButton } from "@clerk/nextjs";
import { MenuIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  CTA_BOOK_A_DEMO,
  CTA_PRACTICE_FOR_FREE,
  NAVIGATION_LINKS,
} from "@/lib/landing/recruitment/constants";
import { cn } from "@/lib/utils";

const LOGO_PATH = "/logo.png";
const LOGO_ALT = "Interview Optimiser Logo";

export default function NavigationBar() {
  const [isSticky, setIsSticky] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 80);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const commonNavLinks = (
    <>
      {NAVIGATION_LINKS.map((link) => (
        <Link
          key={link.label}
          href={link.href}
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          {link.label}
        </Link>
      ))}
    </>
  );

  const commonCTAs = (
    <>
      <Button variant="ghost" asChild>
        <Link href={CTA_PRACTICE_FOR_FREE.href}>{CTA_PRACTICE_FOR_FREE.text}</Link>
      </Button>
      <Button asChild>
        <Link href={CTA_BOOK_A_DEMO.href}>{CTA_BOOK_A_DEMO.text}</Link>
      </Button>
    </>
  );

  return (
    <ClerkProvider dynamic>
      <header
        className={cn(
          "sticky top-0 z-50 w-full border-b border-transparent transition-all duration-300 ease-in-out",
          isSticky ? "border-border bg-background/80 backdrop-blur-lg shadow-md" : "bg-transparent"
        )}
      >
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <Image src={LOGO_PATH} alt={LOGO_ALT} width={32} height={32} />
            <span className="font-semibold text-foreground">Interview Optimiser</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-6 md:flex">
            {commonNavLinks}
            <div className="flex items-center gap-2">{commonCTAs}</div>
          </nav>

          {/* Auth, Theme and Mobile Menu Controls */}
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2">
              <ThemeToggle />
              <SignedIn>
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8",
                    },
                  }}
                />
              </SignedIn>
            </div>

            {/* Mobile Navigation Trigger */}
            <div className="md:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MenuIcon className="h-6 w-6" />
                    <span className="sr-only">Toggle Menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:max-w-xs">
                  <div className="flex flex-col space-y-6 p-6">
                    <div className="flex items-center justify-between">
                      <Link
                        href="/"
                        className="flex items-center gap-2"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Image src={LOGO_PATH} alt={LOGO_ALT} width={24} height={24} />
                        <span className="font-semibold text-foreground">Interview Optimiser</span>
                      </Link>
                      <div className="flex items-center gap-2">
                        <ThemeToggle />
                        <SignedIn>
                          <UserButton
                            afterSignOutUrl="/"
                            appearance={{
                              elements: {
                                avatarBox: "w-8 h-8",
                              },
                            }}
                          />
                        </SignedIn>
                      </div>
                    </div>
                    <nav className="flex flex-col space-y-4">{commonNavLinks}</nav>
                    <div className="mt-auto flex flex-col space-y-3 pt-6 border-t border-border">
                      {commonCTAs}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>
    </ClerkProvider>
  );
}
