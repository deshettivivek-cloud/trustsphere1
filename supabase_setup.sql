-- =============================================
-- TrustSphere RLS Policy Setup
-- Run this in Supabase Dashboard → SQL Editor
-- =============================================

-- Step 1: Enable RLS on all tables (idempotent)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_profiles ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop existing policies (ignore errors if they don't exist)
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can upsert own profile" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON profiles;

DROP POLICY IF EXISTS "Worker profiles are viewable by authenticated users" ON worker_profiles;
DROP POLICY IF EXISTS "Users can insert own worker profile" ON worker_profiles;
DROP POLICY IF EXISTS "Users can update own worker profile" ON worker_profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON worker_profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON worker_profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON worker_profiles;

-- Step 3: Create clean policies

-- PROFILES: Anyone logged in can READ any profile (needed for search page)
CREATE POLICY "profiles_select_authenticated"
ON profiles FOR SELECT
TO authenticated
USING (true);

-- PROFILES: Users can INSERT their own profile only
CREATE POLICY "profiles_insert_own"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

-- PROFILES: Users can UPDATE their own profile only
CREATE POLICY "profiles_update_own"
ON profiles FOR UPDATE
TO authenticated
USING (id = auth.uid());

-- WORKER_PROFILES: Anyone logged in can READ any worker profile (needed for search)
CREATE POLICY "worker_profiles_select_authenticated"
ON worker_profiles FOR SELECT
TO authenticated
USING (true);

-- WORKER_PROFILES: Users can INSERT their own worker profile
CREATE POLICY "worker_profiles_insert_own"
ON worker_profiles FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- WORKER_PROFILES: Users can UPDATE their own worker profile
CREATE POLICY "worker_profiles_update_own"
ON worker_profiles FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- =============================================
-- BOOKINGS TABLE (create if not exists)
-- =============================================
CREATE TABLE IF NOT EXISTS bookings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id uuid REFERENCES auth.users(id),
  worker_id uuid REFERENCES auth.users(id),
  service_type text,
  booking_date date NOT NULL,
  time_slot text NOT NULL,
  note text,
  status text DEFAULT 'pending',
  customer_lat double precision,
  customer_lng double precision,
  customer_address text,
  created_at timestamptz DEFAULT now()
);

-- Add location columns if table already exists
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS customer_lat double precision;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS customer_lng double precision;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS customer_address text;

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert bookings" ON bookings;
DROP POLICY IF EXISTS "Users can view own bookings" ON bookings;
DROP POLICY IF EXISTS "Workers can update booking status" ON bookings;
DROP POLICY IF EXISTS "bookings_insert_customer" ON bookings;
DROP POLICY IF EXISTS "bookings_select_own" ON bookings;
DROP POLICY IF EXISTS "bookings_update_worker" ON bookings;

-- Customers can create bookings
CREATE POLICY "bookings_insert_customer"
ON bookings FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = customer_id);

-- Both customer and worker can view their bookings
CREATE POLICY "bookings_select_own"
ON bookings FOR SELECT
TO authenticated
USING (auth.uid() = customer_id OR auth.uid() = worker_id);

-- Workers can update booking status (accept/decline)
CREATE POLICY "bookings_update_worker"
ON bookings FOR UPDATE
TO authenticated
USING (auth.uid() = worker_id);
