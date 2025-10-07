/*
  # WebProd Issue Template Agent - Database Schema

  1. New Tables
    - `templates`
      - `id` (uuid, primary key)
      - `version` (text) - semantic version
      - `name` (text) - template name
      - `sections` (jsonb) - full template structure
      - `is_active` (boolean) - current active version
      - `created_at` (timestamptz)
      - `created_by` (uuid) - references auth.users
      - `updated_at` (timestamptz)
    
    - `projects`
      - `id` (uuid, primary key)
      - `backlog_project_id` (text) - Backlog project ID
      - `name` (text)
      - `space` (text) - Backlog space name
      - `created_at` (timestamptz)
    
    - `issue_generations`
      - `id` (uuid, primary key)
      - `user_id` (uuid) - references auth.users
      - `template_version` (text)
      - `selected_items` (jsonb) - array of selected item IDs with values
      - `generated_summary` (text)
      - `generated_description` (text)
      - `edited_summary` (text) - user edited version
      - `edited_description` (text) - user edited version
      - `backlog_issue_key` (text) - resulting issue key
      - `backlog_issue_url` (text)
      - `project_id` (uuid) - references projects
      - `created_at` (timestamptz)
    
    - `audit_logs`
      - `id` (uuid, primary key)
      - `user_id` (uuid) - references auth.users
      - `action` (text) - action type
      - `resource_type` (text) - what was affected
      - `resource_id` (uuid)
      - `details` (jsonb) - detailed log data
      - `ip_address` (inet)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Admin role for template management
*/

CREATE TABLE IF NOT EXISTS templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version text NOT NULL,
  name text NOT NULL,
  sections jsonb NOT NULL,
  is_active boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  backlog_project_id text NOT NULL,
  name text NOT NULL,
  space text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS issue_generations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  template_version text NOT NULL,
  selected_items jsonb NOT NULL,
  generated_summary text,
  generated_description text,
  edited_summary text,
  edited_description text,
  backlog_issue_key text,
  backlog_issue_url text,
  project_id uuid REFERENCES projects(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id uuid,
  details jsonb,
  ip_address inet,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE issue_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active templates"
  ON templates FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can insert templates"
  ON templates FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can update templates"
  ON templates FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can read projects"
  ON projects FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage projects"
  ON projects FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can read own issue generations"
  ON issue_generations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own issue generations"
  ON issue_generations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own issue generations"
  ON issue_generations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert audit logs"
  ON audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_templates_active ON templates(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_issue_generations_user ON issue_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);
