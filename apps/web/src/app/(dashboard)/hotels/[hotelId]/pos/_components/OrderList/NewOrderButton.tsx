"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface NewOrderButtonProps {
  onClick: () => void;
  variant?: "default" | "ghost";
  size?: "sm" | "default";
  label?: string;
}

export function NewOrderButton({
  onClick,
  variant = "default",
  size = "sm",
  label = "New Order",
}: NewOrderButtonProps) {
  return (
    <Button variant={variant} size={size} onClick={onClick}>
      <Plus className="h-4 w-4 mr-1.5" />
      {label}
    </Button>
  );
}
