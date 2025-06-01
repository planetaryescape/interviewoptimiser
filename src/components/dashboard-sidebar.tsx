"use client";

import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/useUser";
import { cn } from "@/lib/utils";
import { ClerkProvider } from "@clerk/nextjs";
import { Briefcase, Cog, Home, MessageSquare, ScrollText, Star } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { FeedbackModal } from "./feedback-modal";
import { Separator } from "./ui/separator";

export function DashboardSidebar() {
  const { data: user } = useUser();
  const isAdmin = user?.role === "admin";
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const pathname = usePathname();

  const NavItem = ({
    href,
    icon: Icon,
    children,
  }: {
    href: string;
    icon: React.ElementType;
    children: React.ReactNode;
  }) => (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
        "hover:bg-muted/50 active:bg-muted/70",
        pathname === href
          ? "bg-muted/70 text-primary font-medium"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{children}</span>
    </Link>
  );

  return (
    <aside className="w-64 relative hidden md:flex flex-col justify-between bg-card border-r border-border">
      <div className="relative flex-1 flex flex-col min-h-0">
        <div className="flex-1 flex flex-col pt-8 pb-4 px-4">
          <div className="flex flex-col space-y-1 mb-6">
            <NavItem href="/dashboard" icon={Home}>
              Dashboard
            </NavItem>
            <NavItem href="/dashboard/jobs" icon={Briefcase}>
              Jobs
            </NavItem>
            <NavItem href="/dashboard/settings" icon={Cog}>
              Settings
            </NavItem>
            <Separator className="mt-16" />
            {isAdmin && (
              <div className="mt-16 bg-gray-300 dark:bg-gray-700">
                <div className="mt-8 mb-2 px-3">
                  <p className="text-xs font-medium text-muted-foreground">Admin</p>
                </div>
                <NavItem href="/dashboard/admin/jobs" icon={Briefcase}>
                  Jobs
                </NavItem>
                <NavItem href="/dashboard/admin/changelog" icon={ScrollText}>
                  Changelogs
                </NavItem>
                <NavItem href="/dashboard/admin/feature-requests" icon={Star}>
                  Feature Requests
                </NavItem>
              </div>
            )}
          </div>
        </div>

        <div className="relative p-4">
          <div className="rounded-lg border border-border bg-muted/20 p-4">
            <Button
              variant="ghost"
              className="w-full justify-start hover:bg-muted/50"
              onClick={() => setIsFeedbackModalOpen(true)}
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Give Feedback
            </Button>
          </div>
        </div>
      </div>

      <ClerkProvider dynamic>
        <FeedbackModal isOpen={isFeedbackModalOpen} onClose={() => setIsFeedbackModalOpen(false)} />
      </ClerkProvider>
    </aside>
  );
}
