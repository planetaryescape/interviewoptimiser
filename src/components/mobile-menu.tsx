"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useUser } from "@/hooks/useUser";
import { cn } from "@/lib/utils";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { CreditCard, Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
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

  const NavLink = ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <Link
      href={href}
      onClick={closeMenu}
      className={cn(
        "px-3 py-3 rounded-md transition-colors text-base flex items-center",
        pathname === href
          ? "bg-primary/10 text-primary font-medium"
          : "text-muted-foreground hover:text-primary hover:bg-muted"
      )}
    >
      {children}
    </Link>
  );

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button className="md:hidden relative" variant="ghost" size="sm" aria-label="Open menu">
          <Menu className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full max-w-[300px] p-0">
        <div className="flex flex-col h-full overflow-y-auto">
          <div className="p-6 border-b border-border/50">
            <Link href="/" className="flex items-center gap-2 mb-6" onClick={closeMenu}>
              <Image
                src="/logo.png"
                alt={`${config.projectName} Logo`}
                width={32}
                height={32}
                className="rounded-lg"
              />
              <span className="font-semibold text-foreground">{config.projectName}</span>
            </Link>
            <SheetTitle className="text-lg font-display">Navigation</SheetTitle>
          </div>

          <div className="flex-1 p-6">
            <nav className="flex flex-col space-y-2">
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

          <div className="p-6 border-t border-border/50 bg-muted/50 mt-auto">
            <div className="flex flex-col space-y-4">
              <SignedIn>
                {user && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-background/80">
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
                <div className="flex flex-col gap-2">
                  <Button asChild variant="default" className="w-full">
                    <Link href="/sign-up" onClick={closeMenu}>
                      Start Mock Interview
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
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
