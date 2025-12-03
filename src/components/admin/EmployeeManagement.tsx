import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useEmployees, Employee } from "@/hooks/use-employees";
import { useAuthContext } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Users, Loader2, Trash2, Shield, User as UserIcon } from "lucide-react";
import { AppRole } from "@/hooks/use-auth";

export function EmployeeManagement() {
  const { employees, loading, updateRole, deleteUser } = useEmployees();
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const handleRoleChange = async (userId: string, newRole: AppRole) => {
    setUpdating(userId);
    const { error } = await updateRole(userId, newRole);
    setUpdating(null);

    if (error) {
      toast({ title: "Failed to update role", variant: "destructive" });
    } else {
      toast({ title: "Role updated successfully" });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    const { error } = await deleteUser(deleteTarget.user_id);
    setDeleteTarget(null);

    if (error) {
      toast({ title: "Failed to delete user", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "User deleted successfully" });
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Employee Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : employees.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No employees found.
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((emp) => {
                    const isCurrentUser = emp.user_id === user?.id;
                    return (
                      <TableRow key={emp.user_id}>
                        <TableCell className="font-medium">{emp.full_name}</TableCell>
                        <TableCell>{emp.email}</TableCell>
                        <TableCell>
                          {isCurrentUser ? (
                            <Badge variant={emp.role === "admin" ? "default" : "secondary"}>
                              {emp.role === "admin" ? (
                                <><Shield className="h-3 w-3 mr-1" /> Admin</>
                              ) : (
                                <><UserIcon className="h-3 w-3 mr-1" /> Employee</>
                              )}
                            </Badge>
                          ) : (
                            <Select
                              value={emp.role}
                              onValueChange={(value) => handleRoleChange(emp.user_id, value as AppRole)}
                              disabled={updating === emp.user_id}
                            >
                              <SelectTrigger className="w-32">
                                {updating === emp.user_id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <SelectValue />
                                )}
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="employee">Employee</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {!isCurrentUser && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive"
                              onClick={() => setDeleteTarget(emp)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deleteTarget?.full_name}? This action cannot be undone.
              All their data will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
