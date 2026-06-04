"use client";

import { LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ViewToggleProps {
  view: "grid" | "list";
  onViewChange: (view: "grid" | "list") => void;
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-1">
      <Button
        size="icon"
        variant={view === "grid" ? "default" : "outline"}
        aria-label="Grid view"
        onClick={() => onViewChange("grid")}
        className={cn(view !== "grid" && "text-muted-foreground")}
      >
        <LayoutGrid />
      </Button>
      <Button
        size="icon"
        variant={view === "list" ? "default" : "outline"}
        aria-label="List view"
        onClick={() => onViewChange("list")}
        className={cn(view !== "list" && "text-muted-foreground")}
      >
        <List />
      </Button>
    </div>
  );
}
