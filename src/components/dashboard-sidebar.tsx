"use client";

import { BackgroundGradient } from "@/components/background-gradient";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/useUser";
import { cn } from "@/lib/utils";
import { ClerkProvider } from "@clerk/nextjs";
import { BarChart3, Cog, Home, MessageSquare, ScrollText, Star } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { FeedbackModal } from "./feedback-modal";

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
        "hover:bg-primary/10 active:bg-primary/15",
        pathname === href
          ? "bg-primary/15 text-primary font-medium"
          : "text-muted-foreground hover:text-primary"
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{children}</span>
    </Link>
  );

  return (
    <aside className="w-64 relative hidden md:flex flex-col justify-between">
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-b from-background to-muted/50",
          "border-r border-border/50 backdrop-blur-sm"
        )}
      />

      <div className="relative flex-1 flex flex-col min-h-0">
        <div className="flex-1 flex flex-col pt-8 pb-4 px-4">
          <div className="flex flex-col space-y-1">
            <NavItem href="/dashboard" icon={Home}>
              Interviews
            </NavItem>

            {isAdmin && (
              <>
                <div className="mt-6 mb-2 px-3">
                  <p className="text-xs font-medium text-muted-foreground">Admin</p>
                </div>
                <NavItem href="/dashboard/admin" icon={BarChart3}>
                  Interviews
                </NavItem>
                <NavItem href="/dashboard/admin/changelog" icon={ScrollText}>
                  Changelogs
                </NavItem>
                <NavItem href="/dashboard/admin/feature-requests" icon={Star}>
                  Feature Requests
                </NavItem>
              </>
            )}

            <div className="mt-6 mb-2 px-3">
              <p className="text-xs font-medium text-muted-foreground">Settings</p>
            </div>
            <NavItem href="/dashboard/settings" icon={Cog}>
              Settings
            </NavItem>
          </div>
        </div>

        <div className="relative p-4">
          <div className="rounded-lg border border-border/50 bg-card/30 p-4">
            <Button
              variant="ghost"
              className="w-full justify-start hover:bg-primary/10"
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

      <BackgroundGradient degrees={Math.random() * 360} />
    </aside>
  );
}
