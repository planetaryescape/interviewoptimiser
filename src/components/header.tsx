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
        "sticky top-0 z-50 w-full border-b transition-all duration-300 ease-in-out",
        isScrolled
          ? "bg-background/80 backdrop-blur-lg shadow-md border-border"
          : isDashboard
            ? "bg-card/95 border-border"
            : "bg-background/95 border-border/10",
        className
      )}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
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

        <nav className="hidden md:flex items-center space-x-4">
          <Link
            className={cn(
              "px-3 py-2 text-sm rounded-md transition-colors",
              pathname === "/"
                ? "text-primary font-medium"
                : "text-muted-foreground hover:text-primary hover:bg-muted/50"
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
                  : "text-muted-foreground hover:text-primary hover:bg-muted/50"
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
                : "text-muted-foreground hover:text-primary hover:bg-muted/50"
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
                : "text-muted-foreground hover:text-primary hover:bg-muted/50"
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
                  : "text-muted-foreground hover:text-primary hover:bg-muted/50"
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
                  : "text-muted-foreground hover:text-primary hover:bg-muted/50"
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

      <ClerkProvider dynamic>
        <FeedbackModal isOpen={isFeedbackModalOpen} onClose={() => setIsFeedbackModalOpen(false)} />
      </ClerkProvider>
    </header>
  );
}
