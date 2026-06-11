"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { SidebarContent } from "./Sidebar";
import {
  LayoutDashboard,
  CalendarCheck,
  BedDouble,
  Sparkles,
  Menu,
} from "lucide-react";

const QUICK_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, href: "" },
  { label: "Reservations", icon: CalendarCheck, href: "/reservations" },
  { label: "Rooms", icon: BedDouble, href: "/rooms/grid" },
  { label: "Housekeeping", icon: Sparkles, href: "/housekeeping" },
];

export function MobileTopBar() {
  const [open, setOpen] = useState(false);
  const { activeHotel } = useAuthStore();

  const base = activeHotel ? `/hotels/${activeHotel.id}` : "";

  return (
    <div className="lg:hidden flex items-center justify-between h-12 px-3 border-b bg-background shrink-0">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <div className="h-full overflow-y-auto">
            <SidebarContent onNavClick={() => setOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      <span className="text-base font-bold text-primary">HMS</span>

      <div className="w-8" />
    </div>
  );
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const { activeHotel } = useAuthStore();
  const base = activeHotel ? `/hotels/${activeHotel.id}` : "";
  const [sheetOpen, setSheetOpen] = useState(false);

  if (!activeHotel) return null;

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t safe-area-bottom">
      <div className="flex items-center justify-around h-14 px-2">
        {QUICK_ITEMS.map((item) => {
          const href = base + item.href;
          const isActive =
            item.href === ""
              ? pathname === base || pathname === base + "/"
              : pathname.startsWith(href);

          return (
            <Link
              key={item.label}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 py-1 px-2 rounded-md min-w-0",
                "transition-colors",
              )}
            >
              <div
                className={cn(
                  "h-1 w-6 rounded-full mb-0.5",
                  isActive ? "bg-primary" : "bg-transparent",
                )}
              />
              <item.icon
                className={cn(
                  "h-5 w-5",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground",
                )}
              />
              <span
                className={cn(
                  "text-[10px] truncate max-w-12 text-center",
                  isActive
                    ? "text-primary font-medium"
                    : "text-muted-foreground",
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}

        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <button className="flex flex-col items-center gap-0.5 py-1 px-2 rounded-md">
              <div className="h-1 w-6 rounded-full mb-0.5 bg-transparent" />
              <Menu className="h-5 w-5 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">More</span>
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <div className="h-full overflow-y-auto">
              <SidebarContent onNavClick={() => setSheetOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
