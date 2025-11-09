/*
  # BillFlow Complete Database Schema

  ## Overview
  Complete database schema for BillFlow application including vendors, customers, 
  items, invoices, bills, and their line items.

  ## New Tables
  
  ### `vendors`
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users)
  - `name` (text, required)
  - `email` (text, optional)
  - `phone` (text, optional)
  - `address` (text, optional)
  - `tax_id` (text, optional)
  - `payment_terms` (text, optional)
  - `status` (text, default 'active')
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `customers`
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users)
  - `name` (text, required)
  - `email` (text, optional)
  - `phone` (text, optional)
  - `address` (text, optional)
  - `tax_id` (text, optional)
  - `payment_terms` (text, optional)
  - `status` (text, default 'active')
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `items`
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users)
  - `name` (text, required)
  - `description` (text, optional)
  - `sku` (text, optional)
  - `unit_price` (numeric, required)
  - `unit` (text, default 'pc')
  - `tax_rate` (numeric, default 0)
  - `category` (text, optional)
  - `status` (text, default 'active')
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `invoices`
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users)
  - `customer_id` (uuid, references customers)
  - `invoice_number` (text, required, unique)
  - `invoice_date` (date, required)
  - `due_date` (date, required)
  - `status` (text, default 'draft')
  - `subtotal` (numeric, required)
  - `tax_amount` (numeric, required)
  - `total_amount` (numeric, required)
  - `notes` (text, optional)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `invoice_items`
  - `id` (uuid, primary key)
  - `invoice_id` (uuid, references invoices)
  - `item_id` (uuid, references items, optional)
  - `description` (text, required)
  - `quantity` (numeric, required)
  - `unit_price` (numeric, required)
  - `tax_rate` (numeric, default 0)
  - `amount` (numeric, required)
  - `created_at` (timestamptz)

  ### `bills`
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users)
  - `vendor_id` (uuid, references vendors)
  - `bill_number` (text, required, unique)
  - `bill_date` (date, required)
  - `due_date` (date, required)
  - `status` (text, default 'draft')
  - `subtotal` (numeric, required)
  - `tax_amount` (numeric, required)
  - `total_amount` (numeric, required)
  - `notes` (text, optional)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `bill_items`
  - `id` (uuid, primary key)
  - `bill_id` (uuid, references bills)
  - `item_id` (uuid, references items, optional)
  - `description` (text, required)
  - `quantity` (numeric, required)
  - `unit_price` (numeric, required)
  - `tax_rate` (numeric, default 0)
  - `amount` (numeric, required)
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Users can only access their own data
  - Policies for SELECT, INSERT, UPDATE, DELETE operations
*/

-- Create vendors table
CREATE TABLE IF NOT EXISTS vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  email text,
  phone text,
  address text,
  tax_id text,
  payment_terms text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own vendors"
  ON vendors FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own vendors"
  ON vendors FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vendors"
  ON vendors FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own vendors"
  ON vendors FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  email text,
  phone text,
  address text,
  tax_id text,
  payment_terms text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own customers"
  ON customers FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own customers"
  ON customers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own customers"
  ON customers FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own customers"
  ON customers FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create items table
CREATE TABLE IF NOT EXISTS items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  sku text,
  unit_price numeric(10, 2) NOT NULL DEFAULT 0,
  unit text DEFAULT 'pc' NOT NULL,
  tax_rate numeric(5, 2) DEFAULT 0 NOT NULL,
  category text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own items"
  ON items FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own items"
  ON items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own items"
  ON items FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own items"
  ON items FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  customer_id uuid REFERENCES customers(id) ON DELETE RESTRICT NOT NULL,
  invoice_number text UNIQUE NOT NULL,
  invoice_date date NOT NULL,
  due_date date NOT NULL,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  subtotal numeric(12, 2) NOT NULL DEFAULT 0,
  tax_amount numeric(12, 2) NOT NULL DEFAULT 0,
  total_amount numeric(12, 2) NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own invoices"
  ON invoices FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own invoices"
  ON invoices FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own invoices"
  ON invoices FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own invoices"
  ON invoices FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create invoice_items table
CREATE TABLE IF NOT EXISTS invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
  item_id uuid REFERENCES items(id) ON DELETE SET NULL,
  description text NOT NULL,
  quantity numeric(10, 2) NOT NULL,
  unit_price numeric(10, 2) NOT NULL,
  tax_rate numeric(5, 2) DEFAULT 0 NOT NULL,
  amount numeric(12, 2) NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own invoice items"
  ON invoice_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = invoice_items.invoice_id
      AND invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own invoice items"
  ON invoice_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = invoice_items.invoice_id
      AND invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own invoice items"
  ON invoice_items FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = invoice_items.invoice_id
      AND invoices.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = invoice_items.invoice_id
      AND invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own invoice items"
  ON invoice_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = invoice_items.invoice_id
      AND invoices.user_id = auth.uid()
    )
  );

-- Create bills table
CREATE TABLE IF NOT EXISTS bills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  vendor_id uuid REFERENCES vendors(id) ON DELETE RESTRICT NOT NULL,
  bill_number text UNIQUE NOT NULL,
  bill_date date NOT NULL,
  due_date date NOT NULL,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'paid', 'overdue', 'cancelled')),
  subtotal numeric(12, 2) NOT NULL DEFAULT 0,
  tax_amount numeric(12, 2) NOT NULL DEFAULT 0,
  total_amount numeric(12, 2) NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE bills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bills"
  ON bills FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bills"
  ON bills FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bills"
  ON bills FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bills"
  ON bills FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create bill_items table
CREATE TABLE IF NOT EXISTS bill_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id uuid REFERENCES bills(id) ON DELETE CASCADE NOT NULL,
  item_id uuid REFERENCES items(id) ON DELETE SET NULL,
  description text NOT NULL,
  quantity numeric(10, 2) NOT NULL,
  unit_price numeric(10, 2) NOT NULL,
  tax_rate numeric(5, 2) DEFAULT 0 NOT NULL,
  amount numeric(12, 2) NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE bill_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bill items"
  ON bill_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM bills
      WHERE bills.id = bill_items.bill_id
      AND bills.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own bill items"
  ON bill_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM bills
      WHERE bills.id = bill_items.bill_id
      AND bills.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own bill items"
  ON bill_items FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM bills
      WHERE bills.id = bill_items.bill_id
      AND bills.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM bills
      WHERE bills.id = bill_items.bill_id
      AND bills.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own bill items"
  ON bill_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM bills
      WHERE bills.id = bill_items.bill_id
      AND bills.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vendors_user_id ON vendors(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);
CREATE INDEX IF NOT EXISTS idx_items_user_id ON items(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_bills_user_id ON bills(user_id);
CREATE INDEX IF NOT EXISTS idx_bills_vendor_id ON bills(vendor_id);
CREATE INDEX IF NOT EXISTS idx_bill_items_bill_id ON bill_items(bill_id);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bills_updated_at BEFORE UPDATE ON bills
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
