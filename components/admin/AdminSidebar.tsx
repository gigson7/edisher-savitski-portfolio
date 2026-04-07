"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Video,
  Image,
  FileText,
  LogOut,
} from "lucide-react";

const navItems = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    href: "/admin/performances",
    label: "Performances",
    icon: Calendar,
    exact: false,
  },
  {
    href: "/admin/videos",
    label: "Videos",
    icon: Video,
    exact: false,
  },
  {
    href: "/admin/photos",
    label: "Photos",
    icon: Image,
    exact: false,
  },
  {
    href: "/admin/biography",
    label: "Biography",
    icon: FileText,
    exact: false,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  function isActive(href: string, exact: boolean): boolean {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <aside className="w-64 min-h-screen bg-neutral-900 flex flex-col">
      {/* Brand */}
      <div className="px-6 py-6 border-b border-neutral-800">
        <h1
          className="text-xl font-bold leading-tight"
          style={{
            fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif",
            color: "#8d7336",
          }}
        >
          Edisher Savitski
        </h1>
        <p className="text-xs text-neutral-500 mt-1 tracking-wide uppercase">
          Admin Panel
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "text-white"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-800"
              }`}
              style={
                active
                  ? {
                      backgroundColor: "rgba(141, 115, 54, 0.15)",
                      color: "#c4a35a",
                    }
                  : undefined
              }
            >
              <Icon
                className="w-4 h-4 flex-shrink-0"
                style={active ? { color: "#8d7336" } : undefined}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-neutral-800">
        <form action="/api/admin/logout" method="POST">
          <button
            type="submit"
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            Log Out
          </button>
        </form>
      </div>
    </aside>
  );
}
