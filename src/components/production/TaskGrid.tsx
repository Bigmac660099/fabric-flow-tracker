import { productionPhases, TaskStatus } from "@/lib/production-data";
import { cn } from "@/lib/utils";
import { Check, Clock, Circle } from "lucide-react";

interface TaskGridProps {
  selectedPhase: string;
  getTaskStatus: (phase: string, taskName: string) => TaskStatus;
  onTaskClick: (phase: string, taskName: string) => void;
}

const statusConfig: Record<
  TaskStatus,
  { bg: string; text: string; icon: typeof Check; progressColor: string }
> = {
  Pending: {
    bg: "bg-muted/50",
    text: "text-muted-foreground",
    icon: Circle,
    progressColor: "bg-muted",
  },
  "In Progress": {
    bg: "bg-primary/10",
    text: "text-primary",
    icon: Clock,
    progressColor: "bg-primary/60",
  },
  Completed: {
    bg: "bg-accent",
    text: "text-accent-foreground",
    icon: Check,
    progressColor: "bg-primary",
  },
};

export function TaskGrid({
  selectedPhase,
  getTaskStatus,
  onTaskClick,
}: TaskGridProps) {
  const tasks = productionPhases[selectedPhase]?.tasks || [];

  return (
    <div className="space-y-3">
      {tasks.map((task) => {
        const status = getTaskStatus(selectedPhase, task.name);
        const config = statusConfig[status];
        const Icon = config.icon;
        const progressValue =
          status === "Completed" ? 100 : status === "In Progress" ? 60 : 0;

        return (
          <div
            key={task.name}
            onClick={() => onTaskClick(selectedPhase, task.name)}
            className={cn(
              "group cursor-pointer rounded-lg border p-4 transition-all duration-200 hover:shadow-md",
              config.bg,
              "border-border hover:border-primary/30"
            )}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full transition-colors",
                    status === "Completed"
                      ? "bg-primary text-primary-foreground"
                      : status === "In Progress"
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">{task.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    Duration: {task.duration} days
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="hidden sm:block w-32">
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn(
                        "h-full transition-all duration-500 rounded-full",
                        config.progressColor
                      )}
                      style={{ width: `${progressValue}%` }}
                    />
                  </div>
                </div>
                <span
                  className={cn(
                    "px-3 py-1 rounded-full text-sm font-medium min-w-[100px] text-center",
                    status === "Completed"
                      ? "bg-primary text-primary-foreground"
                      : status === "In Progress"
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {status}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
