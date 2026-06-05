-- Create vaults table
CREATE TABLE public.vaults (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    encrypted_payload TEXT NOT NULL,
    iv TEXT NOT NULL,
    status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'WARNING', 'RELEASED')),
    trigger_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.vaults ENABLE ROW LEVEL SECURITY;

-- Policy: Owners can select their own vaults
CREATE POLICY "Users can view own vaults" ON public.vaults
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Owners can insert their own vaults
CREATE POLICY "Users can insert own vaults" ON public.vaults
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Owners can update their own vaults
CREATE POLICY "Users can update own vaults" ON public.vaults
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Owners can delete their own vaults
CREATE POLICY "Users can delete own vaults" ON public.vaults
    FOR DELETE USING (auth.uid() = user_id);
