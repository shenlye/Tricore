"use client"

import { Icon } from "@iconify/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  { icon: "material-symbols-light:home-outline", label: "主页", href: "/" },
  { icon: "material-symbols-light:desktop-windows-outline", label: "桌面", href: "/home" },
  { icon: "material-symbols-light:info-outline", label: "关于", href: "/about" },
];

export default function Sidebar() {
  const currentPath = usePathname();
  const activeIndex = menuItems.findIndex((item) => item.href === currentPath);

  return (
    <aside className="fixed left-5 top-1/2 z-50 -translate-y-1/2">
      <nav className="group w-14 overflow-hidden bg-background transition-[width] duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] hover:w-50 hover:shadow-[10px_0_30px_rgba(0,0,0,0.2)] rounded-2xl">
        <ul className="relative flex flex-col gap-1 p-2">
          <li
            className="pointer-events-none absolute left-2 right-2 h-10 bg-primary transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] rounded-2xl"
            style={{
              transform: `translateY(${activeIndex * 44}px)`,
              opacity: activeIndex >= 0 ? 1 : 0,
            }}
          />
          {menuItems.map((item) => {
            const isActive = currentPath === item.href;
            return (
              <li key={item.href} className="relative z-10">
                <Link
                  href={item.href}
                  className={`flex h-10 items-center transition-colors duration-200 ${
                    isActive
                      ? "text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-2xl"
                  }`}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center">
                    <Icon
                      icon={item.icon}
                      className={`h-5.5 w-5.5 ${isActive ? "text-primary-foreground" : "text-muted-foreground"}`}
                    />
                  </div>
                  <span
                    className={`ml-3 whitespace-nowrap text-sm opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${
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
  );
}
