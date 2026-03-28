# Supabase Setup Guide — ClutchFlow CRM

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **"New Project"**
3. Name it `clutchflow-crm`
4. Set a strong database password
5. Choose the nearest region
6. Click **"Create new project"**

## Step 2: Get Your Credentials

1. Go to **Settings → API**
2. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **anon/public key** → `SUPABASE_ANON_KEY`
3. Create `.env` in `backend/`:

```bash
cp .env.example .env
```

Then paste your values:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
PORT=3001
```

## Step 3: Create Tables

Go to **SQL Editor** in your Supabase dashboard and run this:

```sql
-- Customers table
CREATE TABLE customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  company VARCHAR(255),
  priority_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  product VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  woo_order_id VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Communication Logs table
CREATE TABLE logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'note',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (optional, for production)
-- ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE logs ENABLE ROW LEVEL SECURITY;
```

## Step 4: Disable RLS (for development)

For local development/demo, disable Row Level Security:

1. Go to **Authentication → Policies**
2. For each table (customers, orders, logs):
   - Click the table
   - Click **"Disable RLS"** (or create a permissive policy)

## Step 5: Seed Sample Data

```bash
cd backend
npm run seed
```

This will populate the database with 8 sample customers, ~25 orders, and ~20 communication logs.

## Step 6: Verify

Open your Supabase dashboard → **Table Editor** and you should see data in all three tables.
