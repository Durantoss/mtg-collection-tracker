-- MTG Collection Tracker - Supabase Database Setup
-- Run these SQL commands in your Supabase SQL Editor

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create collections table
CREATE TABLE IF NOT EXISTS public.collections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    card_name TEXT NOT NULL,
    set_name TEXT,
    set_code TEXT,
    quantity INTEGER DEFAULT 1,
    condition TEXT DEFAULT 'Near Mint',
    is_foil BOOLEAN DEFAULT FALSE,
    purchase_price DECIMAL(10,2),
    current_price DECIMAL(10,2),
    notes TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create invite codes table
CREATE TABLE IF NOT EXISTS public.invite_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    used_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invite_codes ENABLE ROW LEVEL SECURITY;

-- Profiles RLS Policies
-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- Admins can update user profiles
CREATE POLICY "Admins can update profiles" ON public.profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- Collections RLS Policies
-- Users can view their own collections
CREATE POLICY "Users can view own collection" ON public.collections
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert into their own collection
CREATE POLICY "Users can insert own collection" ON public.collections
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own collection
CREATE POLICY "Users can update own collection" ON public.collections
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete from their own collection
CREATE POLICY "Users can delete own collection" ON public.collections
    FOR DELETE USING (auth.uid() = user_id);

-- Admins can view all collections
CREATE POLICY "Admins can view all collections" ON public.collections
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- Invite Codes RLS Policies
-- Anyone can view unused, non-expired invite codes (for registration)
CREATE POLICY "Anyone can view valid invite codes" ON public.invite_codes
    FOR SELECT USING (
        is_used = FALSE AND 
        (expires_at IS NULL OR expires_at > NOW())
    );

-- Admins can view all invite codes
CREATE POLICY "Admins can view all invite codes" ON public.invite_codes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- Admins can create invite codes
CREATE POLICY "Admins can create invite codes" ON public.invite_codes
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- System can update invite codes when used
CREATE POLICY "System can update invite codes" ON public.invite_codes
    FOR UPDATE USING (TRUE);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_collections_user_id ON public.collections(user_id);
CREATE INDEX IF NOT EXISTS idx_collections_card_name ON public.collections(card_name);
CREATE INDEX IF NOT EXISTS idx_collections_set_code ON public.collections(set_code);
CREATE INDEX IF NOT EXISTS idx_invite_codes_code ON public.invite_codes(code);
CREATE INDEX IF NOT EXISTS idx_invite_codes_is_used ON public.invite_codes(is_used);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON public.profiles(is_admin);

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, email, is_admin)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
        NEW.email,
        -- Make the first user (admin email) an admin
        CASE WHEN NEW.email = 'emwilkerson@gmail.com' THEN TRUE ELSE FALSE END
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to call the function on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER handle_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_collections_updated_at
    BEFORE UPDATE ON public.collections
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create function to check user limit (15 users max)
CREATE OR REPLACE FUNCTION public.check_user_limit()
RETURNS TRIGGER AS $$
DECLARE
    user_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count FROM public.profiles WHERE is_active = TRUE;
    
    IF user_count >= 15 THEN
        RAISE EXCEPTION 'Maximum number of users (15) reached. Cannot create new account.';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to enforce user limit
CREATE TRIGGER enforce_user_limit
    BEFORE INSERT ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.check_user_limit();

-- Insert initial admin invite code (expires in 30 days)
INSERT INTO public.invite_codes (code, created_by, expires_at)
SELECT 
    'ADMIN-SETUP-2025',
    '00000000-0000-0000-0000-000000000000'::UUID,
    NOW() + INTERVAL '30 days'
WHERE NOT EXISTS (
    SELECT 1 FROM public.invite_codes WHERE code = 'ADMIN-SETUP-2025'
);

-- Create view for collection statistics
CREATE OR REPLACE VIEW public.collection_stats AS
SELECT 
    user_id,
    COUNT(*) as total_cards,
    SUM(quantity) as total_quantity,
    COUNT(DISTINCT card_name) as unique_cards,
    SUM(current_price * quantity) as total_value,
    SUM(purchase_price * quantity) as total_invested,
    AVG(current_price) as avg_card_value
FROM public.collections
GROUP BY user_id;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Enable realtime for collections (optional - for live updates)
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.collections;
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;

-- Create function to clean up expired invite codes (run periodically)
CREATE OR REPLACE FUNCTION public.cleanup_expired_invites()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.invite_codes 
    WHERE expires_at < NOW() AND is_used = FALSE;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Example: Create a scheduled job to clean up expired invites daily
-- SELECT cron.schedule('cleanup-expired-invites', '0 2 * * *', 'SELECT public.cleanup_expired_invites();');

COMMIT;
