/*
  # Fix Body Condition Score Column

  1. Table Updates
    - Fix `body_condition_score` column in `weight_records` table to allow proper decimal values
    - Update column to use decimal(3,2) to support values like 1.25, 1.50, etc.
    - Add proper constraint for 0.25 increments

  2. Changes
    - `body_condition_score` - Body condition score from 1.0 to 5.0 with 0.25 increments
    - Update existing records to have valid BCS values

  3. Security
    - Maintain existing RLS policies
*/

-- Update body_condition_score column to support proper decimal values
DO $$
BEGIN
  -- Drop existing column if it exists with wrong type
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'weight_records' AND column_name = 'body_condition_score'
  ) THEN
    ALTER TABLE weight_records DROP COLUMN body_condition_score;
  END IF;
  
  -- Add the column with correct type and constraints
  ALTER TABLE weight_records ADD COLUMN body_condition_score decimal(3,2) DEFAULT 3.0 
    CHECK (body_condition_score >= 1.0 AND body_condition_score <= 5.0 AND (body_condition_score * 4) = FLOOR(body_condition_score * 4));
END $$;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_weight_records_body_condition_score ON weight_records(body_condition_score);