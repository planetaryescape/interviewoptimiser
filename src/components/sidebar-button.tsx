import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function SidebarButton({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  return (
    <Link
      className={cn(
        "w-full block px-4 py-2 justify-start font-bold hover:bg-accent/10 dark:hover:bg-accent/30 transition-all duration-250",
        pathname === href
          ? "border-l-2 bg-accent/20 dark:bg-accent/60 border-accent"
          : ""
      )}
      href={href}
    >
      {children}
    </Link>
  );
}
