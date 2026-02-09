"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useNav } from "@/hooks/use-nav";
import { navItems } from "./navigation";

export default function Sidebar() {
  const currentPath = usePathname();
  const activeIndex = navItems.findIndex(item => item.href === currentPath);
  const { isOpen, close } = useNav();

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 z-30 bg-black/50 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={close}
      />

      {/* Sidebar panel */}
      <aside
        className={`fixed top-12 bottom-0 left-0 z-40 w-50 border-r border-border bg-transparent transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-lg ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <nav className="flex h-full flex-col overflow-y-auto">
          {/* Section label */}
          <div className="border-b border-border px-4 py-3">
            <span className="font-mono text-[10px] uppercase text-muted-foreground">
              Navigation
            </span>
          </div>

          {/* Nav items — sharp edges, monospace, no rounded corners */}
          <ul className="relative flex flex-col gap-px ">
            {/* Sliding highlight */}
            <li
              className="pointer-events-none absolute left-0 right-0 h-10 bg-foreground transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{
                transform: `translateY(${activeIndex * 41}px)`,
                opacity: activeIndex >= 0 ? 1 : 0,
              }}
            />
            {navItems.map((item, i) => {
              const isActive = currentPath === item.href;
              return (
                <li key={item.href} className="relative z-10">
                  <Link
                    href={item.href}
                    onClick={() => {
                      if (typeof window !== "undefined" && window.innerWidth < 768)
                        close();
                    }}
                    className={`group flex h-10 items-center gap-3 px-2 font-mono text-xs uppercase tracking-[0.15em] transition-colors duration-200 ${
                      isActive
                        ? "bg-foreground text-background"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {/* Index number */}
                    <span className={`w-4 text-[10px] tabular-nums ${isActive ? "text-background" : "text-muted-foreground/50"}`}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Bottom section — Swiss-style footer mark */}
          <div className="mt-auto border-t border-border px-5 py-4">
            <p className="font-mono text-[9px] uppercase leading-relaxed tracking-[0.3em] text-muted-foreground/40">
              Shenley
              <br />
              © 2026
            </p>
          </div>
        </nav>
      </aside>
    </>
  );
}
