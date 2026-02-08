"use client";

import { useNav } from "@/hooks/use-nav";

export default function TopBar() {
  const { isOpen, toggle } = useNav();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex h-12 items-center border-b border-border bg-background px-6 md:px-8 ">
      <button
        onClick={toggle}
        className="cursor-pointer select-none font-mono text-sm uppercase text-muted-foreground transition-colors hover:text-foreground text-[10px] tracking-[0.3em]"
      >
        [
        {isOpen ? "CLOSE" : "MENU"}
        ]
      </button>
    </header>
  );
}
