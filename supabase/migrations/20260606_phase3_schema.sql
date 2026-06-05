-- Phase 3 Migration: Granular Handover & Cron State Logic

-- Create Beneficiaries Table
CREATE TABLE public.beneficiaries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security on beneficiaries
ALTER TABLE public.beneficiaries ENABLE ROW LEVEL SECURITY;

-- Beneficiaries RLS Policies
CREATE POLICY "Users can view own beneficiaries" ON public.beneficiaries
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own beneficiaries" ON public.beneficiaries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own beneficiaries" ON public.beneficiaries
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own beneficiaries" ON public.beneficiaries
    FOR DELETE USING (auth.uid() = user_id);

-- Update Vaults Table
ALTER TABLE public.vaults
ADD COLUMN beneficiary_id UUID REFERENCES public.beneficiaries(id) ON DELETE SET NULL,
ADD COLUMN countdown_days INTEGER DEFAULT 30;
