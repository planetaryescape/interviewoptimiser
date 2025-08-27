export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex-1 flex flex-col overflow-hidden h-full">
      <div className="container mx-auto p-6 space-y-8 h-full">{children}</div>
    </main>
  );
}
