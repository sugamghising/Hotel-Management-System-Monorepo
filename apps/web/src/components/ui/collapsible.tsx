"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

interface CollapsibleContextValue {
  open: boolean;
  toggle: () => void;
}

const CollapsibleContext = createContext<CollapsibleContextValue | null>(null);

function useCollapsible() {
  const ctx = useContext(CollapsibleContext);
  if (!ctx) throw new Error("Collapsible sub-components must be inside <Collapsible>");
  return ctx;
}

interface CollapsibleProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}

export function Collapsible({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  children,
}: CollapsibleProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const toggle = useCallback(() => {
    const next = !open;
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
  }, [open, isControlled, onOpenChange]);

  return (
    <CollapsibleContext.Provider value={{ open, toggle }}>
      <div data-state={open ? "open" : "closed"}>{children}</div>
    </CollapsibleContext.Provider>
  );
}

interface CollapsibleTriggerProps {
  children: ReactNode;
  className?: string;
  asChild?: boolean;
}

export function CollapsibleTrigger({
  children,
  className,
  asChild,
}: CollapsibleTriggerProps) {
  const { toggle } = useCollapsible();

  if (asChild) {
    return <div onClick={toggle}>{children}</div>;
  }

  return (
    <div className={className} onClick={toggle}>
      {children}
    </div>
  );
}
CollapsibleTrigger.displayName = "CollapsibleTrigger";

interface CollapsibleContentProps {
  children: ReactNode;
  className?: string;
}

export function CollapsibleContent({
  children,
  className,
}: CollapsibleContentProps) {
  const { open } = useCollapsible();

  return (
    <div
      className={cn(
        "overflow-hidden transition-all duration-200",
        open ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0",
        className,
      )}
    >
      {children}
    </div>
  );
}
