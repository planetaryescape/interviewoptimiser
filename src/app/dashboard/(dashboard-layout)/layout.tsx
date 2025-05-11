import { BackgroundGradient } from "@/components/background-gradient";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="relative flex-1 flex flex-col overflow-hidden h-full">
      <div className="w-full h-full p-6 space-y-8">{children}</div>
      <BackgroundGradient />
    </main>
  );
}
