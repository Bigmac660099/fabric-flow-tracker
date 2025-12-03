import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useProductionState } from "@/hooks/use-production-state";
import {
  productionPhases,
  motivationalQuotes,
  phaseIcons,
} from "@/lib/production-data";
import { TaskGrid } from "./TaskGrid";
import { OverallProgress } from "./OverallProgress";
import { MetadataPanel } from "./MetadataPanel";
import { AnalyticsDialog } from "./AnalyticsDialog";
import {
  Package,
  RotateCcw,
  BarChart3,
  Download,
  CheckCircle,
  Clock,
} from "lucide-react";

export function ProductionTracker() {
  const { toast } = useToast();
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const {
    selectedPhase,
    setSelectedPhase,
    getTaskStatus,
    cycleTaskStatus,
    resetPhase,
    stats,
    exportData,
  } = useProductionState();

  const quote = useMemo(() => {
    return motivationalQuotes[
      Math.floor(Math.random() * motivationalQuotes.length)
    ];
  }, []);

  const handleTaskClick = (phase: string, taskName: string) => {
    const currentStatus = getTaskStatus(phase, taskName);
    cycleTaskStatus(phase, taskName);
    const nextStatus =
      currentStatus === "Pending"
        ? "In Progress"
        : currentStatus === "In Progress"
        ? "Completed"
        : "Pending";
    toast({
      title: "Task Updated",
      description: `"${taskName}" is now ${nextStatus}`,
    });
  };

  const handleReset = () => {
    resetPhase(selectedPhase);
    toast({
      title: "Phase Reset",
      description: `All tasks in ${selectedPhase} have been reset to Pending.`,
    });
  };

  const handleExport = () => {
    exportData();
    toast({
      title: "Export Complete",
      description: "Production data has been downloaded as CSV.",
    });
  };

  const phaseData = productionPhases[selectedPhase];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container py-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Package className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground sm:text-2xl">
                  Garment Production Tracker
                </h1>
                <p className="text-sm text-muted-foreground">
                  Track your manufacturing progress
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Phase:
                </span>
                <Select value={selectedPhase} onValueChange={setSelectedPhase}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(productionPhases).map((phase) => (
                      <SelectItem key={phase} value={phase}>
                        <span className="flex items-center gap-2">
                          <span>{phaseIcons[phase]}</span>
                          <span>{phase}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="hidden sm:block px-3 py-1.5 rounded-full bg-muted text-sm font-medium text-muted-foreground">
                <Clock className="inline-block h-4 w-4 mr-1" />
                {phaseData?.timeline}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Tasks */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <span className="text-2xl">{phaseIcons[selectedPhase]}</span>
                  {selectedPhase} Tasks
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Click on a task to cycle its status: Pending → In Progress →
                  Completed
                </p>
              </CardHeader>
              <CardContent>
                <TaskGrid
                  selectedPhase={selectedPhase}
                  getTaskStatus={getTaskStatus}
                  onTaskClick={handleTaskClick}
                />
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleReset} variant="outline">
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset Phase
              </Button>
              <Button onClick={() => setAnalyticsOpen(true)} variant="outline">
                <BarChart3 className="mr-2 h-4 w-4" />
                Analytics
              </Button>
              <Button onClick={handleExport} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>

          {/* Right Column - Stats & Info */}
          <div className="space-y-6">
            {/* Overall Progress */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">🎯 Overall Completion</CardTitle>
              </CardHeader>
              <CardContent>
                <OverallProgress percentComplete={stats.percentComplete} />
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">📊 Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-primary/10 text-center">
                    <CheckCircle className="h-5 w-5 mx-auto mb-1 text-primary" />
                    <p className="text-2xl font-bold text-foreground">
                      {stats.completedTasks}
                    </p>
                    <p className="text-xs text-muted-foreground">Completed</p>
                  </div>
                  <div className="p-3 rounded-lg bg-accent text-center">
                    <Clock className="h-5 w-5 mx-auto mb-1 text-accent-foreground" />
                    <p className="text-2xl font-bold text-foreground">
                      {stats.inProgressTasks}
                    </p>
                    <p className="text-xs text-muted-foreground">In Progress</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Metadata */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">ℹ️ Phase Information</CardTitle>
              </CardHeader>
              <CardContent>
                <MetadataPanel selectedPhase={selectedPhase} />
              </CardContent>
            </Card>

            {/* Motivational Quote */}
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="pt-6">
                <p className="text-sm italic text-muted-foreground leading-relaxed">
                  "{quote}"
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <AnalyticsDialog
        open={analyticsOpen}
        onOpenChange={setAnalyticsOpen}
        stats={stats}
      />
    </div>
  );
}
