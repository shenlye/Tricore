"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { navItems } from "./navigation";

export default function Sidebar() {
  const currentPath = usePathname();
  const activeIndex = navItems.findIndex((item) => item.href === currentPath);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(true)}
        className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-xl bg-background shadow-lg cursor-pointer hover:shadow-xl"
        aria-label="打开菜单"
      >
        <Icon icon="material-symbols-light:menu" className="h-6 w-6 text-foreground" />
      </button>

      <div
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setIsOpen(false)}
      />

      <aside
        className={`fixed left-0 top-0 z-50 h-full w-50 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <nav className="h-full overflow-hidden bg-background shadow-[10px_0_30px_rgba(0,0,0,0.2)]">
          <div className="flex h-14 items-center justify-between px-4">
            <span className="text-sm font-medium text-foreground">菜单</span>
            <button
              onClick={() => setIsOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-accent"
              aria-label="关闭菜单"
            >
              <Icon icon="material-symbols-light:close" className="h-5 w-5 text-foreground" />
            </button>
          </div>

          <ul className="relative flex flex-col gap-2 p-2">
            <li
              className="pointer-events-none absolute left-2 right-2 h-10 rounded-2xl bg-primary transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{
                transform: `translateY(${activeIndex * 48}px)`,
                opacity: activeIndex >= 0 ? 1 : 0,
              }}
            />
            {navItems.map((item) => {
              const isActive = currentPath === item.href;
              return (
                <li key={item.href} className="relative z-10">
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex h-10 items-center rounded-2xl transition-colors duration-200 ${
                      isActive
                        ? "text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center">
                      <Icon
                        icon={item.icon}
                        className={`h-5.5 w-5.5 ${isActive ? "text-primary-foreground" : "text-muted-foreground"}`}
                      />
                    </div>
                    <span
                      className={`ml-3 whitespace-nowrap text-sm ${
                        isActive ? "text-primary-foreground" : "text-foreground"
                      }`}
                    >
                      {item.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </div>
  );
}
