/*
  # Add Payment Support to BillFlow

  1. New Tables
    - `payments` table to track all payments
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `invoice_id` (uuid, references invoices)
      - `customer_id` (uuid, references customers)
      - `amount` (numeric)
      - `payment_method` (text: card, bank_transfer, check, cash)
      - `payment_date` (timestamptz)
      - `status` (text: completed, pending, failed)
      - `reference_number` (text)
      - `created_at` (timestamptz)

  2. Changes to existing tables
    - Add `paid_amount` column to invoices table
    - Add `partial` status to invoices

  3. Security
    - Enable RLS on payments table
    - Allow authenticated users to manage their own payments
    - Allow public (anon) users to create payments and view invoices for payment
*/

-- Add paid_amount column to invoices if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'invoices' AND column_name = 'paid_amount'
  ) THEN
    ALTER TABLE invoices ADD COLUMN paid_amount numeric(12, 2) NOT NULL DEFAULT 0;
  END IF;
END $$;

-- Update invoice status check to include 'partial'
DO $$
BEGIN
  ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_status_check;
  ALTER TABLE invoices ADD CONSTRAINT invoices_status_check
    CHECK (status IN ('draft', 'sent', 'paid', 'partial', 'overdue', 'cancelled'));
END $$;

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  invoice_id uuid REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
  customer_id uuid REFERENCES customers(id) ON DELETE RESTRICT NOT NULL,
  amount numeric(12, 2) NOT NULL,
  payment_method text NOT NULL CHECK (payment_method IN ('card', 'bank_transfer', 'check', 'cash')),
  payment_date timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'failed')),
  reference_number text,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Policies for authenticated users
CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payments"
  ON payments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policies for anonymous users (for public payment page)
CREATE POLICY "Public can view payments"
  ON payments FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Public can create payments"
  ON payments FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow public to view invoices (for payment page)
CREATE POLICY "Public can view invoices for payment"
  ON invoices FOR SELECT
  TO anon
  USING (true);

-- Allow public to update invoice payment status
CREATE POLICY "Public can update invoice payment status"
  ON invoices FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Allow public to view customers (for invoice details on payment page)
CREATE POLICY "Public can view customers"
  ON customers FOR SELECT
  TO anon
  USING (true);
