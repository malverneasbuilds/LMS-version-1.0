/*
  # Update Livestock Management Tables

  1. Table Updates
    - Add stock_type and source columns to herd_register
    - Add observer and delivery_type columns to calf_register  
    - Restructure drug_register with new fields
    - Add withdrawal_period as integer to drug_register

  2. Security
    - Maintain existing RLS policies
    - Update indexes for new columns
*/

-- Update Herd Register Table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'herd_register' AND column_name = 'stock_type'
  ) THEN
    ALTER TABLE herd_register ADD COLUMN stock_type text CHECK (stock_type IN ('bull', 'heifer', 'cow', 'steer'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'herd_register' AND column_name = 'source'
  ) THEN
    ALTER TABLE herd_register ADD COLUMN source text CHECK (source IN ('purchased', 'born_on_farm', 'unknown')) DEFAULT 'unknown';
  END IF;
END $$;

-- Update Calf Register Table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'calf_register' AND column_name = 'observer'
  ) THEN
    ALTER TABLE calf_register ADD COLUMN observer text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'calf_register' AND column_name = 'delivery_type'
  ) THEN
    ALTER TABLE calf_register ADD COLUMN delivery_type text CHECK (delivery_type IN ('normal', 'assisted', 'c_section'));
  END IF;
END $$;

-- Update Drug Register Table - Remove old columns and add new ones
DO $$
BEGIN
  -- Add new columns first
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'drug_register' AND column_name = 'drug_type'
  ) THEN
    ALTER TABLE drug_register ADD COLUMN drug_type text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'drug_register' AND column_name = 'pregnancy_safety'
  ) THEN
    ALTER TABLE drug_register ADD COLUMN pregnancy_safety text CHECK (pregnancy_safety IN ('safe', 'not_safe', 'use_with_caution'));
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'drug_register' AND column_name = 'in_stock'
  ) THEN
    ALTER TABLE drug_register ADD COLUMN in_stock boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'drug_register' AND column_name = 'cost'
  ) THEN
    ALTER TABLE drug_register ADD COLUMN cost decimal(10,2) DEFAULT 0;
  END IF;
  
  -- Update withdrawal_period to be integer (days)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'drug_register' AND column_name = 'withdrawal_period' AND data_type = 'integer'
  ) THEN
    -- Column already exists as integer, do nothing
    NULL;
  ELSE
    -- Add as integer if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'drug_register' AND column_name = 'withdrawal_period'
    ) THEN
      ALTER TABLE drug_register ADD COLUMN withdrawal_period integer DEFAULT 0;
    END IF;
  END IF;
END $$;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_herd_register_stock_type ON herd_register(stock_type);
CREATE INDEX IF NOT EXISTS idx_herd_register_source ON herd_register(source);
CREATE INDEX IF NOT EXISTS idx_calf_register_observer ON calf_register(observer);
CREATE INDEX IF NOT EXISTS idx_calf_register_delivery_type ON calf_register(delivery_type);
CREATE INDEX IF NOT EXISTS idx_drug_register_drug_type ON drug_register(drug_type);
CREATE INDEX IF NOT EXISTS idx_drug_register_pregnancy_safety ON drug_register(pregnancy_safety);
CREATE INDEX IF NOT EXISTS idx_drug_register_in_stock ON drug_register(in_stock);