"use client";

import { useCallback, useMemo, useState } from "react";
import { NavContext, useNav } from "@/hooks/use-nav";

export function NavProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = useCallback(() => setIsOpen(v => !v), []);
  const close = useCallback(() => setIsOpen(false), []);
  const value = useMemo(() => ({ isOpen, toggle, close }), [isOpen, toggle, close]);

  return (
    <NavContext value={value}>
      {children}
    </NavContext>
  );
}

export function MainContent({ children }: { children: React.ReactNode }) {
  const { isOpen } = useNav();

  return (
    <main
      className={`transition-[margin] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] min-h-screen ${
        isOpen ? "md:ml-50" : "md:ml-0"
      }`}
    >
      {children}
    </main>
  );
}
