import { cn } from "@/lib/utils";

interface OverallProgressProps {
  percentComplete: number;
}

export function OverallProgress({ percentComplete }: OverallProgressProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">
          Overall Progress
        </span>
        <span className="text-2xl font-bold text-foreground">
          {percentComplete}%
        </span>
      </div>
      <div className="h-4 rounded-full bg-muted overflow-hidden">
        <div
          className={cn(
            "h-full transition-all duration-700 ease-out rounded-full",
            "bg-gradient-to-r from-primary/80 to-primary"
          )}
          style={{ width: `${percentComplete}%` }}
        />
      </div>
      <p className="text-sm text-muted-foreground">
        {percentComplete < 25 && "Just getting started! Keep moving forward."}
        {percentComplete >= 25 &&
          percentComplete < 50 &&
          "Good progress! You're building momentum."}
        {percentComplete >= 50 &&
          percentComplete < 75 &&
          "Halfway there! Excellent work."}
        {percentComplete >= 75 &&
          percentComplete < 100 &&
          "Almost done! The finish line is in sight."}
        {percentComplete === 100 && "All tasks completed! Outstanding work! 🎉"}
      </p>
    </div>
  );
}
