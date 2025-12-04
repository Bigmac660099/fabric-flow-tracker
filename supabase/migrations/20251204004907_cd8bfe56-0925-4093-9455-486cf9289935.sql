-- Add task locking columns to work_items
ALTER TABLE work_items 
ADD COLUMN IF NOT EXISTS is_locked boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS locked_to_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Update RLS policies for locked work items
-- Drop existing employee policies and recreate with lock logic
DROP POLICY IF EXISTS "Employees can view assigned work items" ON work_items;
DROP POLICY IF EXISTS "Employees can update assigned work items" ON work_items;

-- Employees can view: assigned items OR unlocked items
CREATE POLICY "Employees can view accessible work items"
ON work_items FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR assigned_employee_id = auth.uid()
  OR (is_locked = false)
);

-- Employees can update: assigned items OR (unlocked AND not locked to someone else)
CREATE POLICY "Employees can update accessible work items"
ON work_items FOR UPDATE
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR assigned_employee_id = auth.uid()
  OR (is_locked = false AND locked_to_user_id IS NULL)
  OR locked_to_user_id = auth.uid()
);

-- Create function to validate stage progression
CREATE OR REPLACE FUNCTION validate_stage_progression()
RETURNS TRIGGER AS $$
DECLARE
  stages text[] := ARRAY['Cutting', 'Printing', 'Sewing', 'Finishing', 'Packing', 'Delivery'];
  old_stage_idx int;
  new_stage_idx int;
  prev_stage_date timestamp;
BEGIN
  -- Find indices
  old_stage_idx := array_position(stages, OLD.progress_stage);
  new_stage_idx := array_position(stages, NEW.progress_stage);
  
  -- Allow admins to bypass or allow moving backwards
  IF has_role(auth.uid(), 'admin'::app_role) OR new_stage_idx <= old_stage_idx THEN
    RETURN NEW;
  END IF;
  
  -- Check if trying to skip stages
  IF new_stage_idx > old_stage_idx + 1 THEN
    RAISE EXCEPTION 'Cannot skip stages. Complete % first.', stages[new_stage_idx - 1];
  END IF;
  
  -- Check if previous stage has completion date
  CASE OLD.progress_stage
    WHEN 'Cutting' THEN prev_stage_date := OLD.cutting_date;
    WHEN 'Printing' THEN prev_stage_date := OLD.printing_date;
    WHEN 'Sewing' THEN prev_stage_date := OLD.sewing_date;
    WHEN 'Finishing' THEN prev_stage_date := OLD.finishing_date;
    WHEN 'Packing' THEN prev_stage_date := OLD.packing_date;
    ELSE prev_stage_date := NULL;
  END CASE;
  
  IF prev_stage_date IS NULL AND old_stage_idx > 0 THEN
    RAISE EXCEPTION 'Complete current stage (%) before moving to next.', OLD.progress_stage;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for stage validation
DROP TRIGGER IF EXISTS enforce_stage_progression ON work_items;
CREATE TRIGGER enforce_stage_progression
  BEFORE UPDATE OF progress_stage ON work_items
  FOR EACH ROW
  EXECUTE FUNCTION validate_stage_progression();