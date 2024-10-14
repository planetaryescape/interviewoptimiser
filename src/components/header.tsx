"use client";

import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/useUser";
import { config } from "@/lib/config";
import { cn } from "@/lib/utils";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
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

  const showOptimiseButton =
    !isDashboardLanding && !isLandingPage && !isCreatePage;

  return (
    <header
      className={cn(
        "shadow-sm text-foreground relative z-[100]",
        pathname.startsWith("/dashboard")
          ? "bg-card text-card-foreground border-b border-gray-300 dark:border-gray-700"
          : "bg-background text-foreground",
        className
      )}
    >
      <div className="relative w-full px-4 flex justify-between items-center py-4">
        <Link
          href="/"
          className={cn(
            "font-oswald flex space-x-4 items-center text-2xl font-bold"
          )}
        >
          <Image
            src="/logo.png"
            alt={`${config.projectName} Logo`}
            width={24}
            height={24}
          />
          <span>{config.projectName}</span>
        </Link>
        <div className="flex items-center space-x-2 md:space-x-4">
          <nav className="hidden md:flex space-x-8 items-center">
            <SignedOut>
              <Link href="/pricing">Pricing</Link>
            </SignedOut>
            <Link href="/changelog">Changelog</Link>
            <Link href="/feature-requests">Feature Requests</Link>
            <SignedOut>
              <Button size="sm" asChild variant="ghost">
                <Link href="/sign-in">Sign In</Link>
              </Button>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">Dashboard</Link>
            </SignedIn>
            <SignedIn>
              <Link href="/pricing">Buy Minutes</Link>
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
                <Link href="/dashboard/create">Optimise Your CV Now</Link>
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
              <Link href="/sign-up">Optimise Your CV Now</Link>
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
      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
      />
    </header>
  );
}
