import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  iconBg?: string;
  trend?: { value: number; label: string };
  isLoading?: boolean;
  onClick?: () => void;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  iconBg = "bg-blue-50",
  trend,
  isLoading = false,
  onClick,
}: StatCardProps) {
  return (
    <Card
      className={cn(
        "transition-shadow",
        onClick && "cursor-pointer hover:shadow-md",
      )}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div
          className={cn(
            "w-9 h-9 rounded-xl flex items-center justify-center",
            iconBg,
          )}
        >
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <>
            <Skeleton className="h-8 w-20 mb-1" />
            <Skeleton className="h-3 w-28" />
          </>
        ) : (
          <>
            <div className="text-3xl font-bold tracking-tight">{value}</div>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
            )}
            {trend && (
              <div
                className={cn(
                  "flex items-center gap-1 mt-1 text-xs font-medium",
                  trend.value > 0
                    ? "text-emerald-600"
                    : trend.value < 0
                      ? "text-red-500"
                      : "text-muted-foreground",
                )}
              >
                {trend.value > 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : trend.value < 0 ? (
                  <TrendingDown className="h-3 w-3" />
                ) : (
                  <Minus className="h-3 w-3" />
                )}
                <span>{trend.label}</span>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
