-- Add Instagram Integration columns to perfis_lojas
-- This allows stores to store their long-lived access token and account ID

ALTER TABLE public.perfis_lojas
ADD COLUMN instagram_access_token TEXT,
ADD COLUMN instagram_account_id TEXT;

-- Refresh the schema cache if needed
NOTIFY pgrst, 'reload schema';
