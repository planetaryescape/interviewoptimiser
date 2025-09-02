"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <Button onClick={toggleTheme} variant="ghost" size="icon">
      <Sun className="hidden dark:block h-[1.2rem] w-[1.2rem] rotate-90 transition-all duration-300 dark:-rotate-0" />
      <Moon className="dark:hidden block h-[1.2rem] w-[1.2rem] rotate-0 transition-all duration-300 dark:rotate-90" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
