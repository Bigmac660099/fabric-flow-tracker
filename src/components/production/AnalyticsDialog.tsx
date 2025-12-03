import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BarChart3, CheckCircle, Clock, Circle, Calendar } from "lucide-react";

interface AnalyticsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stats: {
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    pendingTasks: number;
    percentComplete: number;
  };
}

export function AnalyticsDialog({
  open,
  onOpenChange,
  stats,
}: AnalyticsDialogProps) {
  const estimatedCompletion = new Date();
  estimatedCompletion.setDate(estimatedCompletion.getDate() + 14);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Production Analytics
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-full bg-muted">
                  <Circle className="h-4 w-4 text-muted-foreground" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">
                  Total Tasks
                </span>
              </div>
              <p className="text-3xl font-bold text-foreground">
                {stats.totalTasks}
              </p>
            </div>

            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-full bg-primary/20">
                  <CheckCircle className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-medium text-primary">
                  Completed
                </span>
              </div>
              <p className="text-3xl font-bold text-foreground">
                {stats.completedTasks}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {Math.round((stats.completedTasks / stats.totalTasks) * 100) || 0}
                % of total
              </p>
            </div>

            <div className="p-4 rounded-lg bg-accent border border-accent-foreground/20">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-full bg-accent-foreground/10">
                  <Clock className="h-4 w-4 text-accent-foreground" />
                </div>
                <span className="text-sm font-medium text-accent-foreground">
                  In Progress
                </span>
              </div>
              <p className="text-3xl font-bold text-foreground">
                {stats.inProgressTasks}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {Math.round((stats.inProgressTasks / stats.totalTasks) * 100) ||
                  0}
                % of total
              </p>
            </div>

            <div className="p-4 rounded-lg bg-muted/30 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-full bg-muted">
                  <Circle className="h-4 w-4 text-muted-foreground" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">
                  Pending
                </span>
              </div>
              <p className="text-3xl font-bold text-foreground">
                {stats.pendingTasks}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {Math.round((stats.pendingTasks / stats.totalTasks) * 100) || 0}%
                of total
              </p>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-card border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">
                Estimated Completion
              </span>
            </div>
            <p className="text-lg font-semibold text-foreground">
              {estimatedCompletion.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
