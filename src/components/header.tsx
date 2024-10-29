"use client";

import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/useUser";
import { config } from "@/lib/config";
import { cn } from "@/lib/utils";
import { ClerkProvider, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { CreditCard } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { FeedbackModal } from "./feedback-modal";
import { MobileMenu } from "./mobile-menu";
import { ThemeToggle } from "./theme-toggle";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";

export function Header({ className }: { className?: string }) {
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const pathname = usePathname();
  const { data: user } = useUser();
  const isDashboard = pathname.startsWith("/dashboard");
  const isDashboardLanding = pathname === "/dashboard";
  const isLandingPage = pathname === "/";
  const isCreatePage = pathname === "/dashboard/create";
  const isInterviewPage =
    pathname.startsWith("/dashboard/interview") && !pathname.endsWith("report");

  const showOptimiseButton =
    !isDashboardLanding && !isLandingPage && !isCreatePage && !isInterviewPage;

  return (
    <header
      className={cn(
        "shadow-sm text-foreground relative z-[100] border-b border-primary/50",
        pathname.startsWith("/dashboard")
          ? "bg-card text-card-foreground"
          : "bg-background text-foreground",
        className
      )}
    >
      <div className="relative w-full px-4 flex justify-between items-center py-4">
        <Link
          href="/"
          className={cn(
            "font-sans flex space-x-4 items-center text-2xl font-bold lowercase"
          )}
        >
          <Image
            src="/logo.png"
            alt={`${config.projectName} Logo`}
            width={60}
            height={60}
          />
          <span>{config.projectName}</span>
        </Link>
        <div className="flex items-center space-x-2 md:space-x-4 uppercase">
          <nav className="hidden md:flex space-x-8 items-center">
            <Link className={cn(pathname === "/" && "font-bold")} href="/">
              Home
            </Link>
            <SignedOut>
              <Link
                className={cn(pathname === "/pricing" && "font-bold")}
                href="/pricing"
              >
                Pricing
              </Link>
            </SignedOut>
            <Link
              className={cn(pathname === "/changelog" && "font-bold")}
              href="/changelog"
            >
              Changelog
            </Link>
            <Link
              className={cn(pathname === "/feature-requests" && "font-bold")}
              href="/feature-requests"
            >
              Feature Requests
            </Link>
            <SignedOut>
              <Button size="sm" asChild variant="ghost">
                <Link
                  className={cn(pathname === "/sign-in" && "font-bold")}
                  href="/sign-in"
                >
                  Sign In
                </Link>
              </Button>
            </SignedOut>
            <SignedIn>
              <Link
                className={cn(pathname === "/dashboard" && "font-bold")}
                href="/dashboard"
              >
                Dashboard
              </Link>
            </SignedIn>
            <SignedIn>
              <Link
                className={cn(pathname === "/pricing" && "font-bold")}
                href="/pricing"
              >
                Buy Minutes
              </Link>
            </SignedIn>
          </nav>
          <Separator
            orientation="vertical"
            className="hidden md:block h-6 dark:bg-gray-400"
          />
          <SignedIn>
            {user ? (
              <div className="flex items-center gap-2">
                <CreditCard className="hidden md:block h-4 w-4" />
                <span className="font-medium hidden md:block">Minutes:</span>
                <Badge variant="secondary" className="">
                  {user?.minutes}
                </Badge>
              </div>
            ) : null}

            {showOptimiseButton && (
              <Button
                className="hidden md:flex"
                size="sm"
                asChild
                variant="default"
              >
                <Link href="/dashboard/create">New Mock Interview</Link>
              </Button>
            )}
          </SignedIn>

          <SignedOut>
            <Button
              className="hidden md:flex"
              size="sm"
              asChild
              variant="default"
            >
              {isLandingPage ? (
                <Link href="/sign-up">Start Mock Interview</Link>
              ) : (
                <Link href="/sign-up">New Mock Interview</Link>
              )}
            </Button>
          </SignedOut>

          <ThemeToggle />
          <SignedIn>
            <UserButton />
          </SignedIn>

          <MobileMenu
            isDashboard={isDashboard}
            onFeedbackClick={() => setIsFeedbackModalOpen(true)}
          />
        </div>
      </div>
      <ClerkProvider dynamic>
        <FeedbackModal
          isOpen={isFeedbackModalOpen}
          onClose={() => setIsFeedbackModalOpen(false)}
        />
      </ClerkProvider>
    </header>
  );
}
