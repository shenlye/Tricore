export interface NavItem {
  icon: string;
  label: string;
  href: string;
}

export const navItems: NavItem[] = [
  { icon: "material-symbols-light:home-outline", label: "Spawn Point", href: "/" },
  { icon: "material-symbols-light:description", label: "Save Point", href: "/blog" },
  { icon: "material-symbols-light:code-outline", label: "Link Point", href: "/links" },
];
