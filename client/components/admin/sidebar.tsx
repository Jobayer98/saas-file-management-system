"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboardIcon,
  UsersIcon,
  PackageIcon,
  BarChart3Icon,
  SettingsIcon,
  ShieldIcon,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboardIcon },
  { name: "Users", href: "/admin/users", icon: UsersIcon },
  { name: "Packages", href: "/admin/packages", icon: PackageIcon },
  { name: "Statistics", href: "/admin/statistics", icon: BarChart3Icon },
  { name: "Settings", href: "/admin/settings", icon: SettingsIcon },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-card border-r border-border">
      <div className="p-6">
        <div className="flex items-center space-x-2">
          <ShieldIcon className="h-6 w-6 text-primary" />
          <h2 className="text-lg font-semibold">Admin Panel</h2>
        </div>
      </div>
      <nav className="px-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent",
              )}
            >
              <item.icon className="mr-3 h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
