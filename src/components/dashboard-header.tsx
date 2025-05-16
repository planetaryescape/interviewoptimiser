"use client";

import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/useUser";
import { cn } from "@/lib/utils";
import { ClerkProvider, UserButton } from "@clerk/nextjs";
import { CreditCard } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { config } from "~/config";
import { Badge } from "./badge";
import { DashboardMobileMenu } from "./dashboard-mobile-menu";
import { FeedbackModal } from "./feedback-modal";
import { ThemeToggle } from "./theme-toggle";

export function DashboardHeader({ className }: { className?: string }) {
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { data: user } = useUser();
  const isDashboardLanding = pathname === "/dashboard";
  const isCreatePage = pathname === "/dashboard/create";
  const isJobPage = /^\/dashboard\/jobs(?:\/[^\/]*)?$/.test(pathname);

  const showOptimiseButton = !isDashboardLanding && !isCreatePage && !isJobPage;

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
        "w-full border-b transition-all duration-300 ease-in-out bg-card/95 border-border",
        isScrolled ? "backdrop-blur-lg shadow-sm" : "",
        className
      )}
    >
      <div className="mx-auto px-4 md:px-8">
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
                pathname === "/dashboard"
                  ? "text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
              href="/dashboard"
            >
              Dashboard
            </Link>

            <Link
              className={cn(
                "px-3 py-2 text-sm rounded-md transition-colors",
                pathname === "/dashboard/settings"
                  ? "text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
              href="/dashboard/settings"
            >
              Settings
            </Link>

            <Link
              className={cn(
                "px-3 py-2 text-sm rounded-md transition-colors",
                pathname === "/pricing"
                  ? "text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
              href="/pricing"
            >
              Buy Minutes
            </Link>

            <Link
              className={cn(
                "px-3 py-2 text-sm rounded-md transition-colors",
                pathname === "/feature-requests"
                  ? "text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
              href="/feature-requests"
            >
              Feature Requests
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
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

            <div className="flex items-center space-x-2">
              <ThemeToggle />
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8",
                  },
                }}
              />
              <DashboardMobileMenu onFeedbackClick={() => setIsFeedbackModalOpen(true)} />
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
