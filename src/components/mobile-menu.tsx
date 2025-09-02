"use client";

import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { CreditCard, MenuIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useUser } from "@/hooks/useUser";
import { cn } from "@/lib/utils";
import { config } from "~/config";
import { Badge } from "./ui/badge";

interface MobileMenuProps {
  isDashboard: boolean;
  onFeedbackClick: () => void;
}

export function MobileMenu({ isDashboard, onFeedbackClick }: MobileMenuProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { data: user } = useUser();

  const closeMenu = () => setIsOpen(false);

  const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <Link
      href={href}
      onClick={closeMenu}
      className={cn(
        "px-3 py-3 rounded-md transition-colors text-sm font-medium",
        pathname === href
          ? "bg-primary/10 text-primary font-medium"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
      )}
    >
      {children}
    </Link>
  );

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button className="md:hidden" variant="ghost" size="icon" aria-label="Open menu">
          <MenuIcon className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-xs p-0">
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-border/50">
            <div className="flex items-center justify-between mb-4">
              <Link href="/" className="flex items-center gap-2" onClick={closeMenu}>
                <Image
                  src="/logo.png"
                  alt={`${config.projectName} Logo`}
                  width={32}
                  height={32}
                  className="rounded-lg"
                />
                <span className="font-semibold text-foreground">{config.projectName}</span>
              </Link>
              <div className="flex items-center gap-2">
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
            <SheetTitle className="sr-only">Navigation</SheetTitle>
          </div>

          <div className="flex-1 p-6 overflow-y-auto">
            <nav className="flex flex-col space-y-3">
              <NavLink href="/">Home</NavLink>

              {isDashboard && (
                <>
                  <NavLink href="/dashboard">Optimisations</NavLink>
                  {user?.role === "admin" && (
                    <>
                      <NavLink href="/dashboard/admin">Optimisations (Admin)</NavLink>
                      <NavLink href="/dashboard/admin/feature-requests">
                        Feature Requests (Admin)
                      </NavLink>
                      <NavLink href="/dashboard/admin/changelog">Changelog (Admin)</NavLink>
                    </>
                  )}
                  <NavLink href="/dashboard/settings">Settings</NavLink>
                </>
              )}

              <NavLink href="/changelog">Changelog</NavLink>
              <NavLink href="/feature-requests">Feature Requests</NavLink>
              <NavLink href="/pricing">Pricing</NavLink>

              {!isDashboard && (
                <SignedIn>
                  <NavLink href="/dashboard">Dashboard</NavLink>
                </SignedIn>
              )}
            </nav>
          </div>

          <div className="mt-auto p-6 border-t border-border/50 bg-muted/30">
            <div className="flex flex-col space-y-4">
              <SignedIn>
                {user && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-background">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Minutes</span>
                    </div>
                    <Badge variant="secondary" className="font-medium">
                      {user.minutes}
                    </Badge>
                  </div>
                )}

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    onFeedbackClick();
                    setIsOpen(false);
                  }}
                >
                  Give Feedback
                </Button>

                <Button variant="default" className="w-full" asChild>
                  <Link href="/dashboard/create" onClick={closeMenu}>
                    New Mock Interview
                  </Link>
                </Button>
              </SignedIn>

              <SignedOut>
                <div className="flex flex-col gap-3">
                  <Button asChild variant="default" className="w-full">
                    <Link href="/sign-up" onClick={closeMenu}>
                      Start Mock Interview
                    </Link>
                  </Button>
                  <Button asChild variant="ghost" className="w-full">
                    <Link href="/sign-in" onClick={closeMenu}>
                      Sign In
                    </Link>
                  </Button>
                </div>
              </SignedOut>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
