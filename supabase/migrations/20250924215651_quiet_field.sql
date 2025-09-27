/*
  # Animal FCR Tracking System

  1. New Tables
    - `animal_fcr_records` - Store calculated FCR values for animals over specific periods
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `animal_tag` (text, references herd_register.tag_number)
      - `period_start_date` (date, start of FCR calculation period)
      - `period_end_date` (date, end of FCR calculation period)
      - `induction_weight` (decimal, starting weight for the period)
      - `final_weight` (decimal, ending weight for the period)
      - `total_weight_gain` (decimal, calculated weight gain)
      - `total_feed_consumed` (decimal, total feed consumed in kg)
      - `fcr_value` (decimal, calculated FCR)
      - `calculation_date` (timestamptz, when FCR was calculated)
      - `notes` (text, additional notes)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `animal_fcr_records` table
    - Add policy for authenticated users to manage their own FCR records
*/

-- Create animal FCR records table
CREATE TABLE IF NOT EXISTS animal_fcr_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  animal_tag text NOT NULL,
  period_start_date date NOT NULL,
  period_end_date date NOT NULL,
  induction_weight decimal(10,2) NOT NULL DEFAULT 0,
  final_weight decimal(10,2) NOT NULL DEFAULT 0,
  total_weight_gain decimal(10,2) NOT NULL DEFAULT 0,
  total_feed_consumed decimal(10,2) NOT NULL DEFAULT 0,
  fcr_value decimal(10,4) NOT NULL DEFAULT 0,
  calculation_date timestamptz DEFAULT now(),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, animal_tag, period_start_date, period_end_date)
);

-- Enable Row Level Security
ALTER TABLE animal_fcr_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Animal FCR Records
CREATE POLICY "Users can manage their own animal FCR records"
  ON animal_fcr_records
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_animal_fcr_records_user_id ON animal_fcr_records(user_id);
CREATE INDEX IF NOT EXISTS idx_animal_fcr_records_animal_tag ON animal_fcr_records(animal_tag);
CREATE INDEX IF NOT EXISTS idx_animal_fcr_records_period ON animal_fcr_records(period_start_date, period_end_date);
CREATE INDEX IF NOT EXISTS idx_animal_fcr_records_calculation_date ON animal_fcr_records(calculation_date);

-- Create a function to automatically calculate and store FCR when feed intake or weight records are updated
CREATE OR REPLACE FUNCTION calculate_and_store_animal_fcr(
  p_user_id uuid,
  p_animal_tag text,
  p_period_months integer DEFAULT 6
)
RETURNS void AS $$
DECLARE
  v_period_start_date date;
  v_period_end_date date;
  v_induction_weight decimal(10,2);
  v_final_weight decimal(10,2);
  v_total_weight_gain decimal(10,2);
  v_total_feed_consumed decimal(10,2);
  v_fcr_value decimal(10,4);
BEGIN
  -- Calculate period dates
  v_period_end_date := CURRENT_DATE;
  v_period_start_date := v_period_end_date - INTERVAL '1 month' * p_period_months;
  
  -- Get induction weight (earliest weight in period)
  SELECT weight INTO v_induction_weight
  FROM weight_records
  WHERE user_id = p_user_id 
    AND animal_tag = p_animal_tag
    AND weight_date >= v_period_start_date
    AND weight_date <= v_period_end_date
  ORDER BY weight_date ASC
  LIMIT 1;
  
  -- Get final weight (latest weight in period)
  SELECT weight INTO v_final_weight
  FROM weight_records
  WHERE user_id = p_user_id 
    AND animal_tag = p_animal_tag
    AND weight_date >= v_period_start_date
    AND weight_date <= v_period_end_date
  ORDER BY weight_date DESC
  LIMIT 1;
  
  -- Calculate total feed consumed in period
  SELECT COALESCE(SUM(amount_consumed), 0) INTO v_total_feed_consumed
  FROM animal_feed_intake
  WHERE user_id = p_user_id 
    AND animal_tag = p_animal_tag
    AND intake_date >= v_period_start_date
    AND intake_date <= v_period_end_date;
  
  -- Only proceed if we have both weights
  IF v_induction_weight IS NOT NULL AND v_final_weight IS NOT NULL THEN
    v_total_weight_gain := v_final_weight - v_induction_weight;
    
    -- Calculate FCR (avoid division by zero)
    IF v_total_weight_gain > 0 THEN
      v_fcr_value := v_total_feed_consumed / v_total_weight_gain;
    ELSE
      v_fcr_value := 0;
    END IF;
    
    -- Insert or update FCR record
    INSERT INTO animal_fcr_records (
      user_id,
      animal_tag,
      period_start_date,
      period_end_date,
      induction_weight,
      final_weight,
      total_weight_gain,
      total_feed_consumed,
      fcr_value,
      calculation_date
    ) VALUES (
      p_user_id,
      p_animal_tag,
      v_period_start_date,
      v_period_end_date,
      v_induction_weight,
      v_final_weight,
      v_total_weight_gain,
      v_total_feed_consumed,
      v_fcr_value,
      now()
    )
    ON CONFLICT (user_id, animal_tag, period_start_date, period_end_date)
    DO UPDATE SET
      induction_weight = EXCLUDED.induction_weight,
      final_weight = EXCLUDED.final_weight,
      total_weight_gain = EXCLUDED.total_weight_gain,
      total_feed_consumed = EXCLUDED.total_feed_consumed,
      fcr_value = EXCLUDED.fcr_value,
      calculation_date = EXCLUDED.calculation_date,
      updated_at = now();
  END IF;
END;
$$ LANGUAGE plpgsql;