/*
  # Add Body Condition Score and Feed Consumption to Weight Records

  1. Table Updates
    - Add `body_condition_score` column to `weight_records` table (decimal with 0.25 increments, range 1-5)
    - Add `feed_consumed` column to `weight_records` table (decimal, amount of feed consumed that month in kg)
    - Update FCR calculation trigger to use the new feed_consumed column

  2. Changes
    - `body_condition_score` - Body condition score from 1.0 to 5.0 with 0.25 increments
    - `feed_consumed` - Amount of feed consumed in the month (kg)
    - Update FCR calculation to use feed_consumed from weight_records table

  3. Security
    - Maintain existing RLS policies
    - Add indexes for new columns for better performance
*/

-- Add body_condition_score column to weight_records table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'weight_records' AND column_name = 'body_condition_score'
  ) THEN
    ALTER TABLE weight_records ADD COLUMN body_condition_score decimal(3,2) DEFAULT 3.0 CHECK (body_condition_score >= 1.0 AND body_condition_score <= 5.0);
  END IF;
END $$;

-- Add feed_consumed column to weight_records table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'weight_records' AND column_name = 'feed_consumed'
  ) THEN
    ALTER TABLE weight_records ADD COLUMN feed_consumed decimal(10,2) DEFAULT 0;
  END IF;
END $$;

-- Create indexes for better performance on new columns
CREATE INDEX IF NOT EXISTS idx_weight_records_body_condition_score ON weight_records(body_condition_score);
CREATE INDEX IF NOT EXISTS idx_weight_records_feed_consumed ON weight_records(feed_consumed);

-- Update the FCR calculation function to use feed_consumed from weight_records
CREATE OR REPLACE FUNCTION calculate_fcr_on_weight_update()
RETURNS TRIGGER AS $$
DECLARE
  previous_record RECORD;
  weight_gain decimal(10,2);
  calculated_fcr decimal(10,4);
BEGIN
  -- Only calculate FCR if feed_consumed is provided
  IF NEW.feed_consumed > 0 THEN
    -- Get the previous weight record for this animal
    SELECT * INTO previous_record
    FROM weight_records
    WHERE user_id = NEW.user_id 
      AND animal_tag = NEW.animal_tag
      AND weight_date < NEW.weight_date
    ORDER BY weight_date DESC
    LIMIT 1;
    
    -- Calculate FCR if we have a previous record
    IF previous_record IS NOT NULL THEN
      weight_gain := NEW.weight - previous_record.weight;
      
      -- Calculate FCR (avoid division by zero)
      IF weight_gain > 0 THEN
        calculated_fcr := NEW.feed_consumed / weight_gain;
        NEW.fcr := calculated_fcr;
      ELSE
        NEW.fcr := 0;
      END IF;
    ELSE
      -- No previous record, set FCR to 0
      NEW.fcr := 0;
    END IF;
  ELSE
    -- No feed consumption data, set FCR to 0
    NEW.fcr := 0;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger to use updated function
DROP TRIGGER IF EXISTS trigger_calculate_fcr ON weight_records;
CREATE TRIGGER trigger_calculate_fcr
  BEFORE INSERT OR UPDATE ON weight_records
  FOR EACH ROW
  EXECUTE FUNCTION calculate_fcr_on_weight_update();