"use client"

import { cn } from "@/lib/utils";

function Skeleton({ className, as = "span", ...rest }: { className?: string; as?: "span" | "div"; [k: string]: any }) {
  const classes = cn("animate-pulse rounded-md bg-muted inline-block", className);
  if (as === "div") {
    return <div data-slot="skeleton" className={classes} {...rest} />;
  }
  return <span data-slot="skeleton" className={classes} {...rest} />;
}

export { Skeleton }
