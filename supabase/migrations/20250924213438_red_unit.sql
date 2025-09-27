/*
  # Animal Feed Intake Tracking System

  1. New Tables
    - `animal_feed_intake` - Individual animal feed consumption records
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `animal_tag` (text, references herd_register.tag_number)
      - `feed_type` (text, type of feed consumed)
      - `amount_consumed` (decimal, amount in kg)
      - `intake_date` (date, when feed was consumed)
      - `notes` (text, additional notes)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `animal_feed_intake` table
    - Add policy for authenticated users to manage their own feed intake records
*/

-- Create animal feed intake table
CREATE TABLE IF NOT EXISTS animal_feed_intake (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  animal_tag text NOT NULL,
  feed_type text NOT NULL,
  amount_consumed decimal(10,2) NOT NULL DEFAULT 0,
  intake_date date NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, animal_tag, intake_date, feed_type)
);

-- Enable Row Level Security
ALTER TABLE animal_feed_intake ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Animal Feed Intake
CREATE POLICY "Users can manage their own animal feed intake records"
  ON animal_feed_intake
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_animal_feed_intake_user_id ON animal_feed_intake(user_id);
CREATE INDEX IF NOT EXISTS idx_animal_feed_intake_animal_tag ON animal_feed_intake(animal_tag);
CREATE INDEX IF NOT EXISTS idx_animal_feed_intake_date ON animal_feed_intake(intake_date);
CREATE INDEX IF NOT EXISTS idx_animal_feed_intake_feed_type ON animal_feed_intake(feed_type);