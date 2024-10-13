"use client";

import { BackgroundGradient as AnotherBackgroundGradient } from "@/components/background-gradient";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useUser } from "@/hooks/useUser";
import { MessageSquare, Video } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { FeedbackModal } from "./feedback-modal";
import { SidebarButton } from "./sidebar-button";

export default function DashboardSidebar() {
  const { data: user } = useUser();
  const isAdmin = user?.role === "admin";
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  return (
    <aside className="w-64 relative hidden md:flex shadow-md flex-col justify-between bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 text-card-foreground border-r border-gray-300 dark:border-gray-700">
      <div className="p-2">
        <nav className="space-y-2">
          <SidebarButton href="/dashboard">Optimizations</SidebarButton>
          {isAdmin && (
            <SidebarButton href="/dashboard/admin/changelog">
              Changelogs (Admin)
            </SidebarButton>
          )}
          {isAdmin && (
            <SidebarButton href="/dashboard/admin/feature-requests">
              Feature Requests (Admin)
            </SidebarButton>
          )}
          {isAdmin && (
            <SidebarButton href="/dashboard/admin">
              Optimisations (Admin)
            </SidebarButton>
          )}
          <SidebarButton href="/dashboard/settings">Settings</SidebarButton>
          <Link
            href="/dashboard/interview"
            className="flex items-center p-2 text-base font-normal text-muted-foreground rounded-lg hover:bg-muted hover:text-primary"
          >
            <Video className="mr-2 h-4 w-4" />
            <span>Interview</span>
          </Link>
        </nav>
      </div>
      <div className="p-4 space-y-4">
        <Separator className="dark:bg-gray-400" />
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => setIsFeedbackModalOpen(true)}
        >
          <MessageSquare className="mr-2 h-4 w-4" />
          Give us feedback
        </Button>
      </div>
      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
      />

      <AnotherBackgroundGradient degrees={Math.random() * 360} />
    </aside>
  );
}
