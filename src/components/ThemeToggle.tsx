"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

const ThemeToggle = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted ? resolvedTheme === "dark" : false;

  const toggle = () => setTheme(isDark ? "light" : "dark");

  return (
    <Button
      type="button"
      size="icon"
      variant="ghost"
      aria-label={isDark ? "Activer le thème clair" : "Activer le thème sombre"}
      onClick={toggle}
      className="rounded-full"
    >
      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </Button>
  );
};

export default ThemeToggle;