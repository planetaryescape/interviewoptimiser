"use client";

import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/useUser";
import { cn } from "@/lib/utils";
import { ClerkProvider, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { CreditCard } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { config } from "~/config";
import { Badge } from "./badge";
import { FeedbackModal } from "./feedback-modal";
import { MobileMenu } from "./mobile-menu";
import { ThemeToggle } from "./theme-toggle";

export function Header({ className }: { className?: string }) {
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { data: user } = useUser();
  const isDashboard = pathname.startsWith("/dashboard");
  const isDashboardLanding = pathname === "/dashboard";
  const isLandingPage = pathname === "/";
  const isCreatePage = pathname === "/dashboard/create";
  const isInterviewPage =
    pathname.startsWith("/dashboard/interviews") && !pathname.endsWith("report");

  const showOptimiseButton =
    !isDashboardLanding && !isLandingPage && !isCreatePage && !isInterviewPage;

  // Add scroll listener to detect when page is scrolled
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "w-full border-b transition-all duration-300 ease-in-out",
        isScrolled
          ? "bg-card/95 backdrop-blur-lg shadow-sm border-border"
          : isDashboard
            ? "bg-card/95 border-border"
            : "bg-background/95 border-border/40",
        className
      )}
    >
      <div className="mx-auto px-4">
        <div className="relative flex h-16 items-center justify-between">
          <Link
            href="/"
            className="flex items-center space-x-3 transition-all duration-300 hover:opacity-90"
          >
            <Image
              src="/logo.png"
              alt={`${config.projectName} Logo`}
              width={36}
              height={36}
              className="rounded-lg"
            />
            <span className="hidden font-display text-xl font-bold md:block">
              {config.projectName}
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-1">
            <Link
              className={cn(
                "px-3 py-2 text-sm rounded-md transition-colors",
                pathname === "/"
                  ? "text-primary font-medium"
                  : "text-muted-foreground hover:text-primary hover:bg-muted"
              )}
              href="/"
            >
              Home
            </Link>

            <SignedOut>
              <Link
                className={cn(
                  "px-3 py-2 text-sm rounded-md transition-colors",
                  pathname === "/pricing"
                    ? "text-primary font-medium"
                    : "text-muted-foreground hover:text-primary hover:bg-muted"
                )}
                href="/pricing"
              >
                Pricing
              </Link>
            </SignedOut>

            <Link
              className={cn(
                "px-3 py-2 text-sm rounded-md transition-colors",
                pathname === "/changelog"
                  ? "text-primary font-medium"
                  : "text-muted-foreground hover:text-primary hover:bg-muted"
              )}
              href="/changelog"
            >
              Changelog
            </Link>

            <Link
              className={cn(
                "px-3 py-2 text-sm rounded-md transition-colors",
                pathname === "/feature-requests"
                  ? "text-primary font-medium"
                  : "text-muted-foreground hover:text-primary hover:bg-muted"
              )}
              href="/feature-requests"
            >
              Feature Requests
            </Link>

            <SignedIn>
              <Link
                className={cn(
                  "px-3 py-2 text-sm rounded-md transition-colors",
                  pathname === "/dashboard"
                    ? "text-primary font-medium"
                    : "text-muted-foreground hover:text-primary hover:bg-muted"
                )}
                href="/dashboard"
              >
                Dashboard
              </Link>
            </SignedIn>
            <SignedIn>
              <Link
                className={cn(
                  "px-3 py-2 text-sm rounded-md transition-colors",
                  pathname === "/pricing"
                    ? "text-primary font-medium"
                    : "text-muted-foreground hover:text-primary hover:bg-muted"
                )}
                href="/pricing"
              >
                Buy Minutes
              </Link>
            </SignedIn>
          </nav>

          <div className="flex items-center space-x-4">
            <SignedIn>
              {user && (
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-muted rounded-md">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Minutes:</span>
                  <Badge variant="warning" className="font-medium">
                    {user.minutes}
                  </Badge>
                </div>
              )}

              {showOptimiseButton && (
                <Button className="hidden md:flex" size="sm" variant="default" asChild>
                  <Link href="/dashboard/create">New Mock Interview</Link>
                </Button>
              )}
            </SignedIn>

            <SignedOut>
              <div className="hidden md:flex items-center space-x-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/sign-in">Sign In</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/sign-up">
                    {isLandingPage ? "Start Mock Interview" : "New Mock Interview"}
                  </Link>
                </Button>
              </div>
            </SignedOut>

            <div className="flex items-center space-x-2">
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
              <MobileMenu
                isDashboard={isDashboard}
                onFeedbackClick={() => setIsFeedbackModalOpen(true)}
              />
            </div>
          </div>
        </div>
      </div>

      <ClerkProvider dynamic>
        <FeedbackModal isOpen={isFeedbackModalOpen} onClose={() => setIsFeedbackModalOpen(false)} />
      </ClerkProvider>
    </header>
  );
}
