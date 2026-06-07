import { BarChart2 } from "lucide-react";

export function EmptyReport() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
      <BarChart2 className="h-12 w-12 mb-3 opacity-40" />
      <p className="text-sm font-medium">No data for selected period.</p>
      <p className="text-xs mt-1">Try adjusting the date range or preset.</p>
    </div>
  );
}
