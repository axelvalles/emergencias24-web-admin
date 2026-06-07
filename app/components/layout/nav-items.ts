import type { Icons } from "../icons";
import { UserRole } from "~/types/users";

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
  allowedRoles?: readonly UserRole[];
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
    allowedRoles: [UserRole.ADMIN, UserRole.DISPATCHER],
    items: [], // No child items
  },
  {
    title: "Planes",
    url: "/planes",
    icon: "plans",
    shortcut: ["l", "l"],
    isActive: false,
    allowedRoles: [UserRole.ADMIN, UserRole.DISPATCHER],
    items: [],
  },
  {
    title: "Beneficios",
    url: "/beneficios",
    icon: "benefits",
    shortcut: ["b", "f"],
    isActive: false,
    allowedRoles: [UserRole.ADMIN, UserRole.DISPATCHER],
    items: [],
  },
  {
    title: "Suscripciones",
    url: "/suscripciones",
    icon: "subscriptions",
    shortcut: ["s", "s"],
    isActive: false,
    allowedRoles: [UserRole.ADMIN, UserRole.DISPATCHER],
    items: [],
  },
  {
    title: "Empresas",
    url: "/empresas",
    icon: "companies",
    shortcut: ["c", "c"],
    isActive: false,
    allowedRoles: [UserRole.ADMIN, UserRole.DISPATCHER],
    items: [],
  },
  {
    title: "Tickets",
    url: "/tickets",
    icon: "ticket",
    shortcut: ["t", "t"],
    isActive: false,
    allowedRoles: [UserRole.ADMIN, UserRole.DISPATCHER, UserRole.AMBULANCE],
    items: [], // No child items
  },
  {
    title: "Costos",
    url: "/costos-municipio",
    icon: "subscriptions",
    shortcut: ["m", "c"],
    isActive: false,
    allowedRoles: [UserRole.SUPER_ADMIN],
    items: [],
  },
  {
    title: "Usuarios",
    url: "/usuarios",
    icon: "users",
    shortcut: ["u", "u"],
    isActive: false,
    allowedRoles: [UserRole.ADMIN],
    items: [], // No child items
  },
  {
    title: "Unidades",
    url: "/unidades-ambulancia",
    icon: "users",
    shortcut: ["u", "a"],
    isActive: false,
    allowedRoles: [UserRole.ADMIN],
    items: [],
  },
];
