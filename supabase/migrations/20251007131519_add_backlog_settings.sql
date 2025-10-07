/*
  # Add Backlog Connection Settings

  1. New Tables
    - `backlog_settings`
      - `id` (uuid, primary key)
      - `user_id` (uuid) - references auth.users, unique
      - `space_name` (text) - Backlog space name
      - `api_key` (text) - Backlog API key (encrypted)
      - `default_project_id` (text) - Default Backlog project ID
      - `is_connected` (boolean) - Connection status
      - `last_verified_at` (timestamptz) - Last successful verification
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on backlog_settings table
    - Users can only access their own settings
    - Ensure API keys are properly secured

  3. Notes
    - API keys should be encrypted at application level before storage
    - Connection verification should be performed before saving
*/

CREATE TABLE IF NOT EXISTS backlog_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) UNIQUE NOT NULL,
  space_name text NOT NULL,
  api_key text NOT NULL,
  default_project_id text,
  is_connected boolean DEFAULT false,
  last_verified_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE backlog_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own Backlog settings"
  ON backlog_settings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own Backlog settings"
  ON backlog_settings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own Backlog settings"
  ON backlog_settings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own Backlog settings"
  ON backlog_settings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_backlog_settings_user ON backlog_settings(user_id);

CREATE OR REPLACE FUNCTION update_backlog_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER backlog_settings_updated_at
  BEFORE UPDATE ON backlog_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_backlog_settings_updated_at();
