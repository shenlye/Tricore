export interface NavItem {
  icon: string;
  label: string;
  href: string;
}

export const navItems: NavItem[] = [
  { icon: "material-symbols-light:home-outline", label: "主页", href: "/" },
  { icon: "material-symbols-light:description", label: "博客", href: "/blog" },
  { icon: "material-symbols-light:info-outline", label: "关于", href: "/about" },
];
