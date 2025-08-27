"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useUser } from "@/hooks/useUser";
import { cn } from "@/lib/utils";
import { UserButton } from "@clerk/nextjs";
import { CreditCard, MenuIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { config } from "~/config";
import { ThemeToggle } from "./theme-toggle";
import { Badge } from "./ui/badge";

interface DashboardMobileMenuProps {
  onFeedbackClick: () => void;
}

export function DashboardMobileMenu({ onFeedbackClick }: DashboardMobileMenuProps) {
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
          ? "bg-primary/20 text-primary font-medium"
          : "text-white/80 hover:text-white hover:bg-white/10"
      )}
    >
      {children}
    </Link>
  );

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          className="md:hidden text-white"
          variant="ghost"
          size="icon"
          aria-label="Open dashboard menu"
        >
          <MenuIcon className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xs p-0 bg-[#1e2736] border-l border-white/20"
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-white/20">
            <div className="flex items-center justify-between mb-6">
              <Link href="/" className="flex items-center gap-2" onClick={closeMenu}>
                <Image
                  src="/logo.png"
                  alt={`${config.projectName} Logo`}
                  width={32}
                  height={32}
                  className="rounded-lg"
                />
                <span className="font-semibold text-white">{config.projectName}</span>
              </Link>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8",
                    },
                  }}
                />
              </div>
            </div>
            <SheetTitle className="text-lg font-medium text-white">Dashboard</SheetTitle>
          </div>

          <div className="flex-1 p-6 overflow-y-auto">
            <nav className="flex flex-col space-y-3">
              <NavLink href="/dashboard">Dashboard</NavLink>
              <NavLink href="/dashboard/settings">Settings</NavLink>

              {user?.role === "admin" && (
                <>
                  <NavLink href="/dashboard/admin">Optimisations (Admin)</NavLink>
                  <NavLink href="/dashboard/admin/feature-requests">
                    Feature Requests (Admin)
                  </NavLink>
                  <NavLink href="/dashboard/admin/changelog">Changelog (Admin)</NavLink>
                </>
              )}

              <div className="my-3 border-t border-white/20" />

              <NavLink href="/pricing">Buy Minutes</NavLink>
              <NavLink href="/feature-requests">Feature Requests</NavLink>
              <NavLink href="/changelog">Changelog</NavLink>
              <NavLink href="/">Home</NavLink>
            </nav>
          </div>

          <div className="mt-auto p-6 border-t border-white/20 bg-black/20">
            <div className="flex flex-col space-y-4">
              {user && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/10">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-white/80" />
                    <span className="text-sm text-white/80">Minutes</span>
                  </div>
                  <Badge variant="secondary" className="font-medium">
                    {user.minutes}
                  </Badge>
                </div>
              )}

              <Button
                variant="outline"
                className="w-full border-white/20 text-white hover:bg-white/10"
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
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
