-- Phase 4 Migration: Passive Proof-of-Life & Cron Automation

-- Create API Keys Table
CREATE TABLE public.api_keys (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    key_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own api keys" ON public.api_keys
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Enable pg_cron extension (requires superuser access on standard Postgres)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create the cron worker function for status transitions
CREATE OR REPLACE FUNCTION process_vault_countdowns()
RETURNS void AS $$
BEGIN
    -- Transition to WARNING if within 3 days and currently ACTIVE
    UPDATE public.vaults
    SET status = 'WARNING'
    WHERE status = 'ACTIVE' 
      AND trigger_date IS NOT NULL
      AND trigger_date <= NOW() + INTERVAL '3 days'
      AND trigger_date > NOW();

    -- Transition to RELEASED if trigger_date has passed and currently ACTIVE/WARNING
    UPDATE public.vaults
    SET status = 'RELEASED'
    WHERE status IN ('ACTIVE', 'WARNING')
      AND trigger_date IS NOT NULL
      AND trigger_date <= NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule the job to run every midnight
SELECT cron.schedule('daily-vault-eval', '0 0 * * *', 'SELECT process_vault_countdowns()');
