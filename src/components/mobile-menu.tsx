"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useUser } from "@/hooks/useUser";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { CreditCard, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";

interface MobileMenuProps {
  isDashboard: boolean;
  onFeedbackClick: () => void;
}

export function MobileMenu({ isDashboard, onFeedbackClick }: MobileMenuProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { data: user } = useUser();

  const closeMenu = () => setIsOpen(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button className="md:hidden" variant="ghost" size="sm">
          <Menu size={24} className="text-neutral-700 dark:text-neutral-300" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="text-neutral-700 border-gray-300 dark:border-gray-700 dark:text-neutral-300 z-[500]"
      >
        <SheetHeader>
          <SheetTitle className="text-neutral-700 dark:text-neutral-300 border-b pb-4 border-gray-400 dark:border-gray-600">
            Menu
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col h-full mt-4 text-lg font-medium text-neutral-700 dark:text-neutral-300">
          <div className="flex flex-col space-y-4 gap-4 text-center">
            {isDashboard && (
              <>
                <Link href="/dashboard" onClick={closeMenu}>
                  Optimisations
                </Link>
                {user?.role === "admin" && (
                  <>
                    <Link href="/dashboard/admin" onClick={closeMenu}>
                      Optimisations (Admin)
                    </Link>
                    <Link
                      href="/dashboard/admin/feature-requests"
                      onClick={closeMenu}
                    >
                      Feature Requests (Admin)
                    </Link>
                    <Link href="/dashboard/admin/changelog" onClick={closeMenu}>
                      Changelog (Admin)
                    </Link>
                  </>
                )}
                <Link href="/dashboard/settings" onClick={closeMenu}>
                  Settings
                </Link>
              </>
            )}
            <Link href="/changelog" onClick={closeMenu}>
              Changelog
            </Link>
            <Link href="/feature-requests" onClick={closeMenu}>
              Feature Requests
            </Link>
            <SignedOut>
              <Button
                className="w-full"
                size="sm"
                asChild
                variant="default"
                onClick={closeMenu}
              >
                <Link href="/sign-up">Optimise Your CV Now</Link>
              </Button>
              <Button
                className="w-full"
                size="sm"
                asChild
                variant="ghost"
                onClick={closeMenu}
              >
                <Link href="/sign-in">Sign In</Link>
              </Button>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard" onClick={closeMenu}>
                Dashboard
              </Link>
            </SignedIn>
          </div>
          <div className="flex flex-col space-y-4 gap-4 mt-8 text-center">
            <SignedIn>
              <Separator className="dark:bg-gray-400" />
              <SignedIn>
                <div className="flex items-center justify-center gap-2 w-full">
                  <CreditCard className="h-4 w-4" />
                  <span className="font-medium">Credits:</span>
                  <Badge variant="secondary" className="">
                    {user?.credits}
                  </Badge>
                </div>
              </SignedIn>
              <Button
                variant="secondary"
                onClick={() => {
                  onFeedbackClick();
                  setIsOpen(false);
                }}
              >
                Give us feedback
              </Button>
            </SignedIn>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
