import type { Icons } from "../icons";

export interface NavItem {
  title: string;
  url: string;
  disabled?: boolean;
  external?: boolean;
  shortcut?: [string, string];
  icon?: keyof typeof Icons;
  label?: string;
  description?: string;
  isActive?: boolean;
  items?: NavItem[];
}

export interface NavItemWithChildren extends NavItem {
  items: NavItemWithChildren[];
}

export interface NavItemWithOptionalChildren extends NavItem {
  items?: NavItemWithChildren[];
}

export interface FooterItem {
  title: string;
  items: {
    title: string;
    href: string;
    external?: boolean;
  }[];
}

export type MainNavItem = NavItemWithOptionalChildren;

export type SidebarNavItem = NavItemWithChildren;

export const navItems: NavItem[] = [
  {
    title: "Inicio",
    url: "/",
    icon: "dashboard",
    isActive: false,
    shortcut: ["d", "d"],
    items: [], // Empty array as there are no child items for Dashboard
  },
  {
    title: "Pacientes",
    url: "/pacientes",
    icon: "patient",
    shortcut: ["p", "p"],
    isActive: false,
    items: [], // No child items
  },
  {
    title: "Planes",
    url: "/planes",
    icon: "plans",
    shortcut: ["l", "l"],
    isActive: false,
    items: [],
  },
  {
    title: "Suscripciones",
    url: "/suscripciones",
    icon: "subscriptions",
    shortcut: ["s", "s"],
    isActive: false,
    items: [],
  },
  {
    title: "Empresas",
    url: "/empresas",
    icon: "companies",
    shortcut: ["c", "c"],
    isActive: false,
    items: [],
  },
  {
    title: "Tickets",
    url: "/tickets",
    icon: "ticket",
    shortcut: ["t", "t"],
    isActive: false,
    items: [], // No child items
  },
  {
    title: "Usuarios",
    url: "/usuarios",
    icon: "users",
    shortcut: ["u", "u"],
    isActive: false,
    items: [], // No child items
  },
];
