"use client";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-semibold mb-2">Something went wrong</h1>
        <pre className="text-sm text-muted-foreground bg-muted p-4 rounded-lg mb-6 font-mono text-left overflow-x-auto">
          {error.message}
        </pre>
        <button
          onClick={() => reset()}
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Reload Page
        </button>
      </div>
    </div>
  );
}
