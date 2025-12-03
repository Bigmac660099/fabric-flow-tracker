import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { WorkItemsTable } from "@/components/dashboard/WorkItemsTable";
import { WorkItemDialog } from "@/components/dashboard/WorkItemDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useWorkItems, WorkItem, PROGRESS_STAGES } from "@/hooks/use-work-items";
import { useEmployees } from "@/hooks/use-employees";
import { useAuthContext } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Plus, Loader2, Search, ClipboardList, Filter } from "lucide-react";

export default function WorkItems() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WorkItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStage, setFilterStage] = useState<string>("all");

  const { workItems, loading, createWorkItem, updateWorkItem, deleteWorkItem } = useWorkItems();
  const { employees } = useEmployees();
  const { isAdmin } = useAuthContext();
  const { toast } = useToast();

  const filteredItems = workItems.filter((item) => {
    const matchesSearch =
      item.order_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.client_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStage = filterStage === "all" || item.progress_stage === filterStage;
    return matchesSearch && matchesStage;
  });

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
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <ClipboardList className="h-6 w-6" />
              Work Items
            </h1>
            <p className="text-muted-foreground">
              {isAdmin ? "Manage all production work items" : "View and update your assigned items"}
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

        {/* Filters */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by Order ID or Client..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterStage} onValueChange={setFilterStage}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stages</SelectItem>
                  {PROGRESS_STAGES.map((stage) => (
                    <SelectItem key={stage} value={stage}>
                      {stage}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Results</span>
              <span className="text-sm font-normal text-muted-foreground">
                {filteredItems.length} items
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <WorkItemsTable
              items={filteredItems}
              employees={employees}
              isAdmin={isAdmin}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </CardContent>
        </Card>
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
