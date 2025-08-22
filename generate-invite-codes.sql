-- Generate 15 unique invite codes for MTG Collection Tracker
-- Run this in your Supabase SQL Editor after setting up the main schema

-- Function to generate a random invite code
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TEXT AS $$
DECLARE
    new_code TEXT;
    exists_check INTEGER;
BEGIN
    LOOP
        -- Generate a random 12-character code
        new_code := upper(
            substr(md5(random()::text), 1, 4) || '-' ||
            substr(md5(random()::text), 1, 4) || '-' ||
            substr(md5(random()::text), 1, 4)
        );
        
        -- Check if code already exists
        SELECT COUNT(*) INTO exists_check 
        FROM public.invite_codes 
        WHERE code = new_code;
        
        -- If code doesn't exist, return it
        IF exists_check = 0 THEN
            RETURN new_code;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Insert 15 unique invite codes (expires in 365 days)
DO $$
DECLARE
    i INTEGER;
    new_code TEXT;
BEGIN
    FOR i IN 1..15 LOOP
        new_code := generate_invite_code();
        
        INSERT INTO public.invite_codes (code, expires_at, created_at)
        VALUES (
            new_code,
            NOW() + INTERVAL '365 days',
            NOW()
        );
        
        RAISE NOTICE 'Generated invite code: %', new_code;
    END LOOP;
END $$;

-- Display all invite codes for reference
SELECT 
    code,
    is_used,
    expires_at,
    created_at
FROM public.invite_codes 
WHERE code != 'ADMIN-SETUP-2025'
ORDER BY created_at DESC;

-- Clean up the temporary function
DROP FUNCTION IF EXISTS generate_invite_code();
