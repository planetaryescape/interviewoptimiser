import { DashboardSidebar } from "@/components/dashboard-sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full">
      <DashboardSidebar />

      <main className="flex-1 flex flex-col overflow-hidden h-full">
        <div className="container mx-auto p-6 space-y-8 h-full">{children}</div>
      </main>
    </div>
  );
}
