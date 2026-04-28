import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  value: number;
  size?: "sm" | "md" | "lg";
  reviewCount?: number;
  showCount?: boolean;
  className?: string;
};

export function StarRating({
  value,
  size = "sm",
  reviewCount,
  showCount = false,
  className,
}: Props) {
  const safe = Math.max(0, Math.min(5, value || 0));
  const dim = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  }[size];

  return (
    <div className={cn("inline-flex items-center gap-1", className)} data-testid="star-rating">
      <div className="relative inline-flex">
        {/* Empty stars */}
        <div className="flex gap-0.5 text-muted-foreground/40">
          {[0, 1, 2, 3, 4].map((i) => (
            <Star key={i} className={cn(dim, "fill-current")} />
          ))}
        </div>
        {/* Filled overlay */}
        <div
          className="absolute inset-0 flex gap-0.5 overflow-hidden text-amber-400"
          style={{ width: `${(safe / 5) * 100}%` }}
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <Star key={i} className={cn(dim, "shrink-0 fill-current")} />
          ))}
        </div>
      </div>
      {showCount && reviewCount !== undefined && (
        <span className="text-xs text-muted-foreground" data-testid="text-review-count">
          ({reviewCount})
        </span>
      )}
      {showCount && reviewCount === undefined && safe > 0 && (
        <span className="text-xs text-muted-foreground">{safe.toFixed(1)}</span>
      )}
    </div>
  );
}
