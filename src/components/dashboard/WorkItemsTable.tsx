import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WorkItem, ProgressStage } from "@/hooks/use-work-items";
import { Employee } from "@/hooks/use-employees";
import { useAuthContext } from "@/contexts/AuthContext";
import { Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";

interface WorkItemsTableProps {
  items: WorkItem[];
  employees: Employee[];
  isAdmin: boolean;
  onEdit: (item: WorkItem) => void;
  onDelete: (id: string) => void;
}

const stageBadgeColors: Record<ProgressStage, string> = {
  Cutting: "bg-red-100 text-red-800",
  Printing: "bg-blue-100 text-blue-800",
  Sewing: "bg-purple-100 text-purple-800",
  Finishing: "bg-amber-100 text-amber-800",
  Packing: "bg-green-100 text-green-800",
  Delivery: "bg-cyan-100 text-cyan-800",
};

export function WorkItemsTable({ items, employees, isAdmin, onEdit, onDelete }: WorkItemsTableProps) {
  const { user, profile } = useAuthContext();

  const getEmployeeName = (userId: string | null) => {
    if (!userId) return "Unassigned";
    if (userId === user?.id) return profile?.full_name || "You";
    const emp = employees.find((e) => e.user_id === userId);
    return emp?.full_name || "Assigned";
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No work items found. {isAdmin && "Create one to get started!"}
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Qty</TableHead>
            <TableHead>Stage</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.order_id}</TableCell>
              <TableCell>{item.client_name}</TableCell>
              <TableCell>{item.quantity}</TableCell>
              <TableCell>
                <Badge
                  className={stageBadgeColors[item.progress_stage as ProgressStage] || "bg-muted"}
                  variant="secondary"
                >
                  {item.progress_stage}
                </Badge>
              </TableCell>
              <TableCell>{getEmployeeName(item.assigned_employee_id)}</TableCell>
              <TableCell>{format(new Date(item.created_at), "MMM d, yyyy")}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button size="icon" variant="ghost" onClick={() => onEdit(item)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  {isAdmin && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => onDelete(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
