/*
  # Feed Inventory System Improvements

  1. Table Updates
    - Add initial_stock column to track starting inventory
    - Add unit column to specify measurement unit (kg, bags, liters, etc.)
    - Add cost_per_unit for better pricing tracking
    - Add supplier information
    - Add category for feed classification
    - Remove unnecessary columns and restructure for consumption tracking

  2. New Tables
    - `feed_consumption_records` - Monthly consumption tracking
    - Track consumption patterns and calculate remaining stock

  3. Security
    - Enable RLS on new tables
    - Add policies for authenticated users
*/

-- Update feed_inventory table structure
DO $$
BEGIN
  -- Add new columns if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'feed_inventory' AND column_name = 'initial_stock'
  ) THEN
    ALTER TABLE feed_inventory ADD COLUMN initial_stock decimal(10,2) NOT NULL DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'feed_inventory' AND column_name = 'unit'
  ) THEN
    ALTER TABLE feed_inventory ADD COLUMN unit text NOT NULL DEFAULT 'kg' CHECK (unit IN ('kg', 'bags', 'liters', 'tons', 'pounds'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'feed_inventory' AND column_name = 'cost_per_unit'
  ) THEN
    ALTER TABLE feed_inventory ADD COLUMN cost_per_unit decimal(10,2) NOT NULL DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'feed_inventory' AND column_name = 'supplier'
  ) THEN
    ALTER TABLE feed_inventory ADD COLUMN supplier text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'feed_inventory' AND column_name = 'category'
  ) THEN
    ALTER TABLE feed_inventory ADD COLUMN category text CHECK (category IN ('concentrate', 'roughage', 'supplement', 'mineral', 'medication', 'other'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'feed_inventory' AND column_name = 'batch_number'
  ) THEN
    ALTER TABLE feed_inventory ADD COLUMN batch_number text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'feed_inventory' AND column_name = 'storage_location'
  ) THEN
    ALTER TABLE feed_inventory ADD COLUMN storage_location text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'feed_inventory' AND column_name = 'minimum_stock_level'
  ) THEN
    ALTER TABLE feed_inventory ADD COLUMN minimum_stock_level decimal(10,2) DEFAULT 0;
  END IF;
END $$;

-- Create feed consumption records table
CREATE TABLE IF NOT EXISTS feed_consumption_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  feed_inventory_id uuid REFERENCES feed_inventory(id) ON DELETE CASCADE,
  consumption_date date NOT NULL,
  amount_consumed decimal(10,2) NOT NULL DEFAULT 0,
  remaining_stock decimal(10,2) NOT NULL DEFAULT 0,
  consumption_type text CHECK (consumption_type IN ('daily_feeding', 'monthly_update', 'adjustment', 'waste')) DEFAULT 'monthly_update',
  notes text,
  recorded_by text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, feed_inventory_id, consumption_date)
);

-- Enable Row Level Security
ALTER TABLE feed_consumption_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Feed Consumption Records
CREATE POLICY "Users can manage their own feed consumption records"
  ON feed_consumption_records
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_feed_inventory_category ON feed_inventory(category);
CREATE INDEX IF NOT EXISTS idx_feed_inventory_supplier ON feed_inventory(supplier);
CREATE INDEX IF NOT EXISTS idx_feed_inventory_expiry_date ON feed_inventory(expiry_date);
CREATE INDEX IF NOT EXISTS idx_feed_consumption_records_user_id ON feed_consumption_records(user_id);
CREATE INDEX IF NOT EXISTS idx_feed_consumption_records_feed_id ON feed_consumption_records(feed_inventory_id);
CREATE INDEX IF NOT EXISTS idx_feed_consumption_records_date ON feed_consumption_records(consumption_date);

-- Create a function to automatically update current_stock when consumption is recorded
CREATE OR REPLACE FUNCTION update_feed_stock_on_consumption()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the current_stock in feed_inventory table
  UPDATE feed_inventory 
  SET current_stock = NEW.remaining_stock,
      updated_at = now()
  WHERE id = NEW.feed_inventory_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update stock levels
DROP TRIGGER IF EXISTS trigger_update_feed_stock ON feed_consumption_records;
CREATE TRIGGER trigger_update_feed_stock
  AFTER INSERT OR UPDATE ON feed_consumption_records
  FOR EACH ROW
  EXECUTE FUNCTION update_feed_stock_on_consumption();