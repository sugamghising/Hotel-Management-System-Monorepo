"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, ChevronDown, RefreshCw } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mb-4">
        <AlertTriangle className="h-8 w-8 text-destructive" />
      </div>
      <h2 className="text-xl font-semibold mb-1">Something went wrong</h2>
      <p className="text-sm text-muted-foreground mb-6 text-center max-w-md">
        An unexpected error occurred while rendering this page.
      </p>

      {process.env.NODE_ENV === "development" && (
        <div className="w-full max-w-lg mb-6">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronDown
              className={`h-3 w-3 transition-transform ${showDetails ? "rotate-180" : ""}`}
            />
            Show error details
          </button>
          {showDetails && (
            <pre className="mt-2 text-xs text-muted-foreground bg-muted p-3 rounded-lg font-mono overflow-x-auto">
              {error.message}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          )}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Reload
        </button>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
