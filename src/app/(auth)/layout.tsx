import { ClerkProvider } from "@clerk/nextjs";
import { type ReactNode, Suspense } from "react";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";

export default function LandingPage({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f7f7f7] dark:bg-gray-900 flex flex-col">
      <Suspense fallback={<div>Loading...</div>}>
        <ClerkProvider dynamic>
          <Header />
        </ClerkProvider>
      </Suspense>

      <main className="flex-grow w-full h-full grid place-items-center">{children}</main>

      <Footer />
    </div>
  );
}
