import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { StageCard } from "@/components/dashboard/StageCard";
import { WorkItemsTable } from "@/components/dashboard/WorkItemsTable";
import { WorkItemDialog } from "@/components/dashboard/WorkItemDialog";
import { TeamChat } from "@/components/dashboard/TeamChat";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWorkItems, WorkItem, PROGRESS_STAGES } from "@/hooks/use-work-items";
import { useEmployees } from "@/hooks/use-employees";
import { useAuthContext } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Plus, Loader2, TrendingUp } from "lucide-react";

export default function Dashboard() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WorkItem | null>(null);
  const [filterStage, setFilterStage] = useState<string | null>(null);

  const { workItems, loading, createWorkItem, updateWorkItem, deleteWorkItem, getStageStats } =
    useWorkItems();
  const { employees } = useEmployees();
  const { isAdmin, profile } = useAuthContext();
  const { toast } = useToast();

  const stageStats = getStageStats();
  const totalItems = workItems.length;

  const filteredItems = filterStage
    ? workItems.filter((item) => item.progress_stage === filterStage)
    : workItems;

  const handleSave = async (data: Partial<WorkItem>) => {
    let result;
    if (editingItem) {
      result = await updateWorkItem(editingItem.id, data);
    } else {
      result = await createWorkItem(data);
    }

    if (result.error) {
      toast({ title: "Error", description: result.error.message, variant: "destructive" });
    } else {
      toast({ title: editingItem ? "Item updated" : "Item created" });
      setEditingItem(null);
    }
  };

  const handleEdit = (item: WorkItem) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await deleteWorkItem(id);
    if (error) {
      toast({ title: "Failed to delete", variant: "destructive" });
    } else {
      toast({ title: "Item deleted" });
    }
  };

  const handleStageClick = (stage: string) => {
    setFilterStage(filterStage === stage ? null : stage);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {profile?.full_name?.split(" ")[0]}!</h1>
            <p className="text-muted-foreground">
              {isAdmin ? "Here's your production overview" : "Here are your assigned work items"}
            </p>
          </div>
          {isAdmin && (
            <Button
              onClick={() => {
                setEditingItem(null);
                setDialogOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Work Item
            </Button>
          )}
        </div>

        {/* Stats Overview */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5" />
              Production Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalItems}</div>
            <p className="text-muted-foreground">Total work items</p>
          </CardContent>
        </Card>

        {/* Stage Cards */}
        <div>
          <h2 className="text-lg font-semibold mb-4">
            Progress Stages
            {filterStage && (
              <Button
                variant="ghost"
                size="sm"
                className="ml-2"
                onClick={() => setFilterStage(null)}
              >
                Clear filter
              </Button>
            )}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {PROGRESS_STAGES.map((stage) => (
              <StageCard
                key={stage}
                stage={stage}
                count={stageStats[stage]}
                onClick={() => handleStageClick(stage)}
              />
            ))}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Work Items Table */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>
                  {filterStage ? `${filterStage} Items` : "Recent Work Items"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <WorkItemsTable
                  items={filteredItems.slice(0, 10)}
                  employees={employees}
                  isAdmin={isAdmin}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </CardContent>
            </Card>
          </div>

          {/* Team Chat */}
          <div className="lg:col-span-1">
            <TeamChat />
          </div>
        </div>
      </div>

      <WorkItemDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        item={editingItem}
        employees={employees}
        isAdmin={isAdmin}
        onSave={handleSave}
      />
    </AppLayout>
  );
}
