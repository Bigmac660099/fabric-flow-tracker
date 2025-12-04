import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { WorkItem, PROGRESS_STAGES, ProgressStage } from "@/hooks/use-work-items";
import { Employee } from "@/hooks/use-employees";
import { Loader2, Lock, Calendar } from "lucide-react";
import { format } from "date-fns";

interface WorkItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: WorkItem | null;
  employees: Employee[];
  isAdmin: boolean;
  onSave: (data: Partial<WorkItem>) => Promise<void>;
}

const stageToDateField: Record<ProgressStage, keyof WorkItem> = {
  Cutting: "cutting_date",
  Printing: "printing_date",
  Sewing: "sewing_date",
  Finishing: "finishing_date",
  Packing: "packing_date",
  Delivery: "delivery_date",
};

export function WorkItemDialog({
  open,
  onOpenChange,
  item,
  employees,
  isAdmin,
  onSave,
}: WorkItemDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<WorkItem>>({
    order_id: "",
    client_name: "",
    quantity: 1,
    progress_stage: "Cutting",
    notes: "",
    assigned_employee_id: null,
    is_locked: false,
    locked_to_user_id: null,
  });

  useEffect(() => {
    if (item) {
      setFormData(item);
    } else {
      setFormData({
        order_id: "",
        client_name: "",
        quantity: 1,
        progress_stage: "Cutting",
        notes: "",
        assigned_employee_id: null,
        is_locked: false,
        locked_to_user_id: null,
      });
    }
  }, [item, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onSave(formData);
    setLoading(false);
    onOpenChange(false);
  };

  const handleMarkStageComplete = () => {
    const currentStage = formData.progress_stage as ProgressStage;
    const dateField = stageToDateField[currentStage];
    if (dateField) {
      setFormData({
        ...formData,
        [dateField]: new Date().toISOString(),
      });
    }
  };

  const isEditMode = !!item;
  const canEditAllFields = isAdmin;
  const currentStage = formData.progress_stage as ProgressStage;
  const currentStageDateField = stageToDateField[currentStage];
  const isCurrentStageComplete = currentStageDateField && formData[currentStageDateField];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Work Item" : "Create Work Item"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="order_id">Order ID</Label>
              <Input
                id="order_id"
                value={formData.order_id || ""}
                onChange={(e) => setFormData({ ...formData, order_id: e.target.value })}
                disabled={!canEditAllFields}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity || 1}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                disabled={!canEditAllFields}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="client_name">Client Name</Label>
            <Input
              id="client_name"
              value={formData.client_name || ""}
              onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
              disabled={!canEditAllFields}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="progress_stage">Progress Stage</Label>
            <Select
              value={formData.progress_stage || "Cutting"}
              onValueChange={(value) => setFormData({ ...formData, progress_stage: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROGRESS_STAGES.map((stage) => (
                  <SelectItem key={stage} value={stage}>
                    {stage}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Stage completion button */}
          {isEditMode && (
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {isCurrentStageComplete
                    ? `${currentStage} completed: ${format(new Date(formData[currentStageDateField] as string), "MMM d, yyyy")}`
                    : `Mark ${currentStage} as complete`}
                </span>
              </div>
              {!isCurrentStageComplete && (
                <Button type="button" size="sm" variant="outline" onClick={handleMarkStageComplete}>
                  Complete
                </Button>
              )}
            </div>
          )}

          {canEditAllFields && (
            <>
              <div className="space-y-2">
                <Label htmlFor="assigned_employee">Assigned Employee</Label>
                <Select
                  value={formData.assigned_employee_id || "unassigned"}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      assigned_employee_id: value === "unassigned" ? null : value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {employees.map((emp) => (
                      <SelectItem key={emp.user_id} value={emp.user_id}>
                        {emp.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Task locking section */}
              <div className="space-y-3 p-3 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="is_locked" className="cursor-pointer">Lock Task</Label>
                  </div>
                  <Switch
                    id="is_locked"
                    checked={formData.is_locked || false}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        is_locked: checked,
                        locked_to_user_id: checked ? formData.locked_to_user_id : null,
                      })
                    }
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  When locked, only the assigned user can access this task.
                </p>

                {formData.is_locked && (
                  <div className="space-y-2">
                    <Label htmlFor="locked_to_user">Lock to User</Label>
                    <Select
                      value={formData.locked_to_user_id || "none"}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          locked_to_user_id: value === "none" ? null : value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select user to lock to" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Same as assigned</SelectItem>
                        {employees.map((emp) => (
                          <SelectItem key={emp.user_id} value={emp.user_id}>
                            {emp.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes || ""}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditMode ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
