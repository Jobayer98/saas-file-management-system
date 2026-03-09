"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  FolderIcon,
  FileIcon,
  UploadIcon,
  StarIcon,
  SettingsIcon,
  CreditCardIcon,
  MenuIcon,
  XIcon,
  Trash2Icon,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: FolderIcon },
  { name: "Files", href: "/dashboard/files", icon: FileIcon },
  { name: "Upload", href: "/dashboard/upload", icon: UploadIcon },
  { name: "Favorites", href: "/dashboard/favorites", icon: StarIcon },
  { name: "Trash", href: "/dashboard/trash", icon: Trash2Icon },
  {
    name: "Subscription",
    href: "/dashboard/subscription",
    icon: CreditCardIcon,
  },
  { name: "Settings", href: "/dashboard/settings", icon: SettingsIcon },
];

interface DashboardSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function DashboardSidebar({
  isCollapsed,
  onToggle,
}: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <div
      className={cn(
        "bg-card border-r border-border transition-all duration-300 flex flex-col",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      <div
        className={cn(
          "p-6 flex items-center",
          isCollapsed ? "justify-center" : "justify-between",
        )}
      >
        {!isCollapsed && (
          <h2 className="text-lg font-semibold">File Manager</h2>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className={cn("h-8 w-8 p-0", isCollapsed && "mx-auto")}
        >
          {isCollapsed ? (
            <MenuIcon className="h-4 w-4" />
          ) : (
            <XIcon className="h-4 w-4" />
          )}
        </Button>
      </div>
      <nav className={cn("px-4 space-y-1 flex-1", isCollapsed && "px-2")}>
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
                isCollapsed && "justify-center px-2",
              )}
              title={isCollapsed ? item.name : undefined}
            >
              <item.icon className={cn("h-4 w-4", !isCollapsed && "mr-3")} />
              {!isCollapsed && item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
