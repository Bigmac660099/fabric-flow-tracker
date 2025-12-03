import { useState, useCallback, useMemo } from "react";
import { productionPhases, TaskStatus } from "@/lib/production-data";

export function useProductionState() {
  const [selectedPhase, setSelectedPhase] = useState<string>("Development");
  const [taskStatus, setTaskStatus] = useState<Record<string, TaskStatus>>({});

  const getTaskKey = (phase: string, taskName: string) => `${phase}|${taskName}`;

  const getTaskStatus = useCallback(
    (phase: string, taskName: string): TaskStatus => {
      const key = getTaskKey(phase, taskName);
      return taskStatus[key] || "Pending";
    },
    [taskStatus]
  );

  const cycleTaskStatus = useCallback((phase: string, taskName: string) => {
    const key = getTaskKey(phase, taskName);
    setTaskStatus((prev) => {
      const current = prev[key] || "Pending";
      const next: TaskStatus =
        current === "Pending"
          ? "In Progress"
          : current === "In Progress"
          ? "Completed"
          : "Pending";
      return { ...prev, [key]: next };
    });
  }, []);

  const resetPhase = useCallback((phase: string) => {
    setTaskStatus((prev) => {
      const updated = { ...prev };
      const phaseTasks = productionPhases[phase]?.tasks || [];
      phaseTasks.forEach((task) => {
        const key = getTaskKey(phase, task.name);
        delete updated[key];
      });
      return updated;
    });
  }, []);

  const stats = useMemo(() => {
    let totalTasks = 0;
    let completedTasks = 0;
    let inProgressTasks = 0;

    Object.keys(productionPhases).forEach((phase) => {
      productionPhases[phase].tasks.forEach((task) => {
        totalTasks++;
        const status = getTaskStatus(phase, task.name);
        if (status === "Completed") completedTasks++;
        if (status === "In Progress") inProgressTasks++;
      });
    });

    const pendingTasks = totalTasks - completedTasks - inProgressTasks;
    const percentComplete =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      pendingTasks,
      percentComplete,
    };
  }, [taskStatus, getTaskStatus]);

  const exportData = useCallback(() => {
    const rows: string[] = ["Phase,Task,Status,Date"];
    const date = new Date().toISOString().split("T")[0];

    Object.keys(productionPhases).forEach((phase) => {
      productionPhases[phase].tasks.forEach((task) => {
        const status = getTaskStatus(phase, task.name);
        rows.push(`"${phase}","${task.name}","${status}","${date}"`);
      });
    });

    const csvContent = rows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `production_report_${new Date().toISOString().slice(0, 10)}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [getTaskStatus]);

  return {
    selectedPhase,
    setSelectedPhase,
    getTaskStatus,
    cycleTaskStatus,
    resetPhase,
    stats,
    exportData,
  };
}
