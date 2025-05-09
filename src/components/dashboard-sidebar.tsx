"use client";

import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/useUser";
import { cn } from "@/lib/utils";
import { ClerkProvider } from "@clerk/nextjs";
import { BarChart3, Cog, FileText, Home, MessageSquare, ScrollText, Star } from "lucide-react";
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
        "hover:bg-white/10 active:bg-white/15",
        pathname === href
          ? "bg-white/15 text-primary font-medium"
          : "text-white/80 hover:text-white"
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{children}</span>
    </Link>
  );

  return (
    <aside className="w-64 relative hidden md:flex flex-col justify-between bg-[#1b2230] border-r border-white/10">
      <div className="relative flex-1 flex flex-col min-h-0">
        <div className="flex-1 flex flex-col pt-8 pb-4 px-4">
          <div className="flex flex-col space-y-1 mb-6">
            <div className="flex items-center text-white mb-2 px-3">
              <Home className="h-4 w-4 mr-2 text-primary" />
              <span className="font-semibold text-white">Interviews</span>
            </div>
            <NavItem href="/dashboard" icon={Home}>
              Interviews
            </NavItem>
            <NavItem href="/dashboard/jobs" icon={FileText}>
              Job Descriptions
            </NavItem>

            {isAdmin && (
              <>
                <div className="mt-6 mb-2 px-3">
                  <p className="text-xs font-medium text-white/70">Admin</p>
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
              <p className="text-xs font-medium text-white/70">Settings</p>
            </div>
            <NavItem href="/dashboard/settings" icon={Cog}>
              Settings
            </NavItem>
          </div>
        </div>

        <div className="relative p-4">
          <div className="rounded-lg border border-white/10 bg-black/20 p-4">
            <Button
              variant="ghost"
              className="w-full justify-start text-white hover:bg-white/10"
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
