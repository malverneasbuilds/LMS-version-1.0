/*
  # Livestock Management System Database Schema

  1. New Tables
    - `herd_register` - Main livestock registry
    - `calf_register` - Calf records
    - `drug_register` - Drug inventory
    - `pregnancy_register` - Pregnancy and calving records
    - `breeding_soundness` - Bull breeding soundness evaluations
    - `feed_inventory` - Feed stock management
    - `health_records` - Animal health and treatment records
    - `weight_records` - Monthly weight tracking
    - `heat_detection` - Heat detection and breeding records

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own farm data
*/

-- Herd Register Table
CREATE TABLE IF NOT EXISTS herd_register (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  tag_number text NOT NULL,
  breed text NOT NULL,
  age integer NOT NULL,
  sex text NOT NULL CHECK (sex IN ('male', 'female')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, tag_number)
);

-- Calf Register Table
CREATE TABLE IF NOT EXISTS calf_register (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  tag_number text NOT NULL,
  age integer NOT NULL,
  sex text NOT NULL CHECK (sex IN ('male', 'female')),
  birth_weight decimal(5,2),
  weaning_weight decimal(5,2),
  weaning_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, tag_number)
);

-- Drug Register Table
CREATE TABLE IF NOT EXISTS drug_register (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  drug_name text NOT NULL,
  expiry_date date NOT NULL,
  quantity text NOT NULL,
  date_received date NOT NULL,
  unit_cost decimal(10,2) NOT NULL,
  withdrawal_period integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Pregnancy Register Table (Matrix format)
CREATE TABLE IF NOT EXISTS pregnancy_register (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  year_number integer NOT NULL,
  prebreeding_bcs decimal(2,1),
  last_service_date date,
  first_pd date,
  second_pd date,
  third_pd date,
  gestation_period integer,
  expected_calving_date date,
  actual_calving_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, year_number)
);

-- Bull Breeding Soundness Table
CREATE TABLE IF NOT EXISTS breeding_soundness (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  tag text NOT NULL,
  age integer NOT NULL,
  pe text NOT NULL CHECK (pe IN ('poor', 'good', 'excellent')),
  sperm_mortality text NOT NULL CHECK (sperm_mortality IN ('poor', 'good', 'excellent')),
  sperm_morphology decimal(5,2) NOT NULL,
  scrotal decimal(5,2) NOT NULL,
  libido text NOT NULL CHECK (libido IN ('poor', 'good', 'excellent')),
  score decimal(4,2) NOT NULL,
  classification text NOT NULL CHECK (classification IN ('SPB', 'USPB', 'CD')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, tag)
);

-- Feed Inventory Table
CREATE TABLE IF NOT EXISTS feed_inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  feed_type text NOT NULL,
  brand text NOT NULL,
  date_received date NOT NULL,
  expiry_date date NOT NULL,
  current_stock decimal(10,2) NOT NULL DEFAULT 0,
  total_price decimal(10,2) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Health Records Table
CREATE TABLE IF NOT EXISTS health_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('mass', 'individual')),
  event text NOT NULL,
  tag text,
  diagnosis text,
  treatment text,
  drug_administering text,
  special_notes text,
  done_by text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Weight Records Table
CREATE TABLE IF NOT EXISTS weight_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  animal_tag text NOT NULL,
  weight_date date NOT NULL,
  weight decimal(6,2) NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, animal_tag, weight_date)
);

-- Heat Detection Table
CREATE TABLE IF NOT EXISTS heat_detection (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  tag text NOT NULL,
  stock_type text NOT NULL,
  body_condition_score decimal(2,1),
  heat_detection_date date,
  observer text,
  serviced_date date,
  breeding_status text,
  breeding_method text,
  ai_technician text,
  sire_id_straw_id text,
  semen_viability text,
  return_to_heat_date_1 date,
  date_served date,
  breeding_method_2 text,
  sire_used text,
  return_to_heat_date_2 date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, tag)
);

-- Enable Row Level Security
ALTER TABLE herd_register ENABLE ROW LEVEL SECURITY;
ALTER TABLE calf_register ENABLE ROW LEVEL SECURITY;
ALTER TABLE drug_register ENABLE ROW LEVEL SECURITY;
ALTER TABLE pregnancy_register ENABLE ROW LEVEL SECURITY;
ALTER TABLE breeding_soundness ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE heat_detection ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Herd Register
CREATE POLICY "Users can manage their own herd records"
  ON herd_register
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for Calf Register
CREATE POLICY "Users can manage their own calf records"
  ON calf_register
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for Drug Register
CREATE POLICY "Users can manage their own drug records"
  ON drug_register
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for Pregnancy Register
CREATE POLICY "Users can manage their own pregnancy records"
  ON pregnancy_register
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for Breeding Soundness
CREATE POLICY "Users can manage their own breeding soundness records"
  ON breeding_soundness
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for Feed Inventory
CREATE POLICY "Users can manage their own feed inventory"
  ON feed_inventory
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for Health Records
CREATE POLICY "Users can manage their own health records"
  ON health_records
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for Weight Records
CREATE POLICY "Users can manage their own weight records"
  ON weight_records
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for Heat Detection
CREATE POLICY "Users can manage their own heat detection records"
  ON heat_detection
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_herd_register_user_id ON herd_register(user_id);
CREATE INDEX IF NOT EXISTS idx_herd_register_tag_number ON herd_register(tag_number);
CREATE INDEX IF NOT EXISTS idx_calf_register_user_id ON calf_register(user_id);
CREATE INDEX IF NOT EXISTS idx_drug_register_user_id ON drug_register(user_id);
CREATE INDEX IF NOT EXISTS idx_pregnancy_register_user_id ON pregnancy_register(user_id);
CREATE INDEX IF NOT EXISTS idx_breeding_soundness_user_id ON breeding_soundness(user_id);
CREATE INDEX IF NOT EXISTS idx_feed_inventory_user_id ON feed_inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_health_records_user_id ON health_records(user_id);
CREATE INDEX IF NOT EXISTS idx_weight_records_user_id ON weight_records(user_id);
CREATE INDEX IF NOT EXISTS idx_heat_detection_user_id ON heat_detection(user_id);