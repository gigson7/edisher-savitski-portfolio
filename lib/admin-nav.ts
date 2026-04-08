import {
  LayoutDashboard,
  Calendar,
  Video,
  Image,
  FileText,
  type LucideIcon,
} from "lucide-react";

export type AdminNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact: boolean;
};

export const adminNavItems: AdminNavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/performances", label: "Performances", icon: Calendar, exact: false },
  { href: "/admin/videos", label: "Videos", icon: Video, exact: false },
  { href: "/admin/photos", label: "Photos", icon: Image, exact: false },
  { href: "/admin/biography", label: "Biography", icon: FileText, exact: false },
];

export function isAdminNavActive(
  pathname: string,
  href: string,
  exact: boolean
): boolean {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}
