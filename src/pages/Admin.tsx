import { Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { EmployeeManagement } from "@/components/admin/EmployeeManagement";
import { useAuthContext } from "@/contexts/AuthContext";
import { Loader2, Settings } from "lucide-react";

export default function Admin() {
  const { isAdmin, loading } = useAuthContext();

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Admin Settings
          </h1>
          <p className="text-muted-foreground">Manage users and system settings</p>
        </div>

        <EmployeeManagement />
      </div>
    </AppLayout>
  );
}
