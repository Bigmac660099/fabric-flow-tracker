# RBAC Quick Reference Guide

## Role Capabilities Matrix

| Feature | Admin | Employee |
|---------|-------|----------|
| View all profiles | ✅ Yes | ❌ No (own only) |
| View email addresses | ✅ All users | ❌ Own only |
| Create work items | ✅ Yes | ❌ No |
| Delete work items | ✅ Yes | ❌ No |
| View work items | ✅ All items | ⚠️ Assigned only |
| Edit work items | ✅ Full edit | ⚠️ Progress/notes only |
| Assign work items | ✅ Yes | ❌ No |
| Manage user roles | ✅ Yes | ❌ No |
| Delete users | ✅ Yes | ❌ No |
| Team chat (read) | ✅ Yes | ✅ Yes |
| Team chat (delete own) | ✅ Yes | ✅ Yes |
| Team chat (delete any) | ✅ Yes | ❌ No |

---

## Database Security Quick Reference

### Checking User Role in RLS Policy
```sql
-- Check if user has specific role
has_role(auth.uid(), 'admin'::app_role)

-- Check if user owns resource
auth.uid() = user_id

-- Combined check (owner OR admin)
(auth.uid() = user_id) OR has_role(auth.uid(), 'admin'::app_role)
```

### Common RLS Patterns

**Admin Full Access, Employee Restricted:**
```sql
-- Admins: full access
CREATE POLICY "Admins can do X"
  ON table_name FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Employees: limited access
CREATE POLICY "Employees can do Y"
  ON table_name FOR SELECT
  TO authenticated
  USING (some_user_id_column = auth.uid());
```

---

## Frontend Access Control Patterns

### Component-Level Protection
```typescript
import { useAuthContext } from "@/contexts/AuthContext";

function MyComponent() {
  const { isAdmin, user, profile } = useAuthContext();

  // Conditional rendering
  if (!isAdmin) {
    return <div>Access Denied</div>;
  }

  // Or conditional features
  return (
    <div>
      {isAdmin && <AdminFeature />}
      <EmployeeFeature />
    </div>
  );
}
```

### Page-Level Protection
```typescript
import { Navigate } from "react-router-dom";
import { useAuthContext } from "@/contexts/AuthContext";

export default function AdminPage() {
  const { isAdmin, loading } = useAuthContext();

  if (loading) return <Loader />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  return <AdminContent />;
}
```

---

## API Query Patterns

### Fetching Data with RLS
```typescript
// RLS automatically filters results
// No manual filtering needed in application code
const { data, error } = await supabase
  .from("work_items")
  .select("*");
// Employees: returns only assigned items
// Admins: returns all items
```

### Conditional Queries
```typescript
// Only fetch if admin
const fetchEmployees = async () => {
  if (!isAdmin) {
    return { data: [], error: null };
  }

  return await supabase
    .from("profiles")
    .select("user_id, full_name, email");
};
```

---

## Common Pitfalls & Solutions

### Pitfall 1: Exposing Emails in Components
❌ **Wrong:**
```typescript
<div>{employee.email}</div>
```

✅ **Correct:**
```typescript
{isAdmin && <div>{employee.email}</div>}
// Or don't fetch email at all for employees
```

### Pitfall 2: Client-Side Only Filtering
❌ **Wrong:**
```typescript
// RLS not enforced - security hole!
const items = allItems.filter(item => item.assigned_to === user.id);
```

✅ **Correct:**
```typescript
// RLS enforced at database level
const { data: items } = await supabase
  .from("work_items")
  .select("*");
// Database automatically filters by RLS policy
```

### Pitfall 3: Exposing User IDs to Enumerate Data
❌ **Wrong:**
```typescript
// Trying to fetch profile by user_id as employee
const { data } = await supabase
  .from("profiles")
  .select("*")
  .eq("user_id", someOtherUserId);
// Returns empty - but attempt logged
```

✅ **Correct:**
```typescript
// Use denormalized data or admin checks
const displayName = isAdmin
  ? employees.find(e => e.user_id === userId)?.full_name
  : "Assigned Employee";
```

---

## Testing Security

### Manual Testing Commands

**Test as Employee (Browser Console):**
```javascript
// Should return only own profile
await supabase.from("profiles").select("*");

// Should return only assigned items
await supabase.from("work_items").select("*");

// Should return only own role
await supabase.from("user_roles").select("*");
```

**Test as Admin:**
```javascript
// Should return all profiles
await supabase.from("profiles").select("*");

// Should return all work items
await supabase.from("work_items").select("*");

// Should return all roles
await supabase.from("user_roles").select("*");
```

### Automated Test Ideas

```typescript
describe("RBAC Security", () => {
  it("employees cannot access other profiles", async () => {
    // Login as employee
    const { data } = await supabase.from("profiles").select("*");
    expect(data).toHaveLength(1); // Only own profile
    expect(data[0].user_id).toBe(currentUser.id);
  });

  it("employees only see assigned work items", async () => {
    // Login as employee
    const { data } = await supabase.from("work_items").select("*");
    expect(data.every(item =>
      item.assigned_employee_id === currentUser.id
    )).toBe(true);
  });
});
```

---

## Adding New Role-Protected Features

### Step-by-Step Checklist

1. **Database Level (CRITICAL)**
   - [ ] Create RLS policies for new table/feature
   - [ ] Test policies with both admin and employee users
   - [ ] Add indexes for performance

2. **API/Hook Level**
   - [ ] Add role checks in data fetching hooks
   - [ ] Return appropriate data based on role
   - [ ] Handle empty results gracefully

3. **Frontend Level**
   - [ ] Add conditional rendering based on `isAdmin`
   - [ ] Hide admin-only UI elements for employees
   - [ ] Protect routes with role checks

4. **Testing**
   - [ ] Verify RLS blocks unauthorized access
   - [ ] Test with both user roles
   - [ ] Check for data leakage in network tab

### Example: Adding New "Reports" Feature

**1. Database (RLS Policy):**
```sql
-- Admins only
CREATE POLICY "Admins can view reports"
  ON reports FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
```

**2. Hook:**
```typescript
export function useReports() {
  const { isAdmin } = useAuthContext();

  const fetchReports = async () => {
    if (!isAdmin) return { data: [], error: null };
    return await supabase.from("reports").select("*");
  };

  return { fetchReports };
}
```

**3. Component:**
```typescript
function ReportsPage() {
  const { isAdmin } = useAuthContext();

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <ReportsContent />;
}
```

---

## Environment-Specific Notes

### Development
- Test with multiple user accounts (admin + employees)
- Use Supabase dashboard to view RLS policy results
- Enable query logging to debug access issues

### Production
- Never disable RLS on production tables
- Monitor for failed authorization attempts
- Regularly audit user access patterns
- Keep RLS policies simple and maintainable

---

## Emergency Procedures

### If Security Breach Detected

1. **Immediate Action**: Disable affected user accounts
2. **Audit**: Review database query logs
3. **Patch**: Apply security fix
4. **Verify**: Re-test with security checklist
5. **Document**: Update security incident log

### If RLS Policy Blocking Legitimate Access

1. **Verify**: Check user role in `user_roles` table
2. **Test**: Run policy manually in Supabase SQL editor
3. **Debug**: Check `auth.uid()` matches expected user_id
4. **Fix**: Update policy or user role as appropriate

---

## Resources

- **Supabase RLS Docs**: https://supabase.com/docs/guides/auth/row-level-security
- **Postgres RLS**: https://www.postgresql.org/docs/current/ddl-rowsecurity.html
- **Security Best Practices**: See SECURITY_IMPLEMENTATION.md
- **Migration History**: `supabase/migrations/`

---

## Quick Commands

**Check Your Current Role:**
```sql
SELECT role FROM user_roles WHERE user_id = auth.uid();
```

**View All RLS Policies:**
```sql
SELECT * FROM pg_policies WHERE schemaname = 'public';
```

**Test Policy as Specific User:**
```sql
SET SESSION AUTHORIZATION 'user@example.com';
SELECT * FROM work_items; -- See what this user sees
RESET SESSION AUTHORIZATION;
```
