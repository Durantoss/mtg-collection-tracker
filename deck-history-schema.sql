-- Deck History Table Schema
-- Add this to your Supabase database to enable deck history tracking

-- Create deck_history table
CREATE TABLE IF NOT EXISTS deck_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    deck_id TEXT NOT NULL,
    deck_name TEXT NOT NULL,
    archetype TEXT,
    action TEXT NOT NULL CHECK (action IN ('created', 'shared', 'received', 'imported')),
    synergy_score INTEGER CHECK (synergy_score >= 0 AND synergy_score <= 100),
    rarity_common INTEGER DEFAULT 0,
    rarity_rare INTEGER DEFAULT 0,
    rarity_mythic INTEGER DEFAULT 0,
    source_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_deck_history_user_id ON deck_history(user_id);
CREATE INDEX IF NOT EXISTS idx_deck_history_timestamp ON deck_history(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_deck_history_deck_id ON deck_history(deck_id);
CREATE INDEX IF NOT EXISTS idx_deck_history_action ON deck_history(action);
CREATE INDEX IF NOT EXISTS idx_deck_history_archetype ON deck_history(archetype);

-- Enable Row Level Security (RLS)
ALTER TABLE deck_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can view their own deck history
CREATE POLICY "Users can view own deck history" ON deck_history
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own deck history
CREATE POLICY "Users can insert own deck history" ON deck_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own deck history
CREATE POLICY "Users can update own deck history" ON deck_history
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own deck history
CREATE POLICY "Users can delete own deck history" ON deck_history
    FOR DELETE USING (auth.uid() = user_id);

-- Admin users can view all deck history (optional)
CREATE POLICY "Admins can view all deck history" ON deck_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'ADMIN'
        )
    );

-- Create a function to get deck statistics
CREATE OR REPLACE FUNCTION get_user_deck_stats(target_user_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_decks', COUNT(*) FILTER (WHERE action = 'created'),
        'shared_decks', COUNT(*) FILTER (WHERE action = 'shared'),
        'received_decks', COUNT(*) FILTER (WHERE action = 'received'),
        'imported_decks', COUNT(*) FILTER (WHERE action = 'imported'),
        'average_synergy', COALESCE(AVG(synergy_score) FILTER (WHERE synergy_score IS NOT NULL), 0),
        'favorite_archetype', (
            SELECT archetype 
            FROM deck_history 
            WHERE user_id = target_user_id AND archetype IS NOT NULL
            GROUP BY archetype 
            ORDER BY COUNT(*) DESC 
            LIMIT 1
        ),
        'archetype_breakdown', (
            SELECT json_object_agg(archetype, count)
            FROM (
                SELECT archetype, COUNT(*) as count
                FROM deck_history 
                WHERE user_id = target_user_id AND archetype IS NOT NULL
                GROUP BY archetype
            ) t
        )
    ) INTO result
    FROM deck_history
    WHERE user_id = target_user_id;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get recent deck activity (for admin dashboard)
CREATE OR REPLACE FUNCTION get_recent_deck_activity(activity_limit INTEGER DEFAULT 50)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    username TEXT,
    deck_id TEXT,
    deck_name TEXT,
    archetype TEXT,
    action TEXT,
    synergy_score INTEGER,
    timestamp TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        dh.id,
        dh.user_id,
        p.username,
        dh.deck_id,
        dh.deck_name,
        dh.archetype,
        dh.action,
        dh.synergy_score,
        dh.timestamp
    FROM deck_history dh
    LEFT JOIN profiles p ON dh.user_id = p.id
    ORDER BY dh.timestamp DESC
    LIMIT activity_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON deck_history TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_deck_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_recent_deck_activity(INTEGER) TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE deck_history IS 'Tracks user deck creation, sharing, and import activities';
COMMENT ON COLUMN deck_history.deck_id IS 'Unique identifier for the deck (can be generated client-side)';
COMMENT ON COLUMN deck_history.action IS 'Type of action: created, shared, received, imported';
COMMENT ON COLUMN deck_history.synergy_score IS 'Calculated synergy score for the deck (0-100)';
COMMENT ON COLUMN deck_history.source_user_id IS 'User ID who shared the deck (for received/imported actions)';
COMMENT ON FUNCTION get_user_deck_stats(UUID) IS 'Returns aggregated statistics for a user''s deck history';
COMMENT ON FUNCTION get_recent_deck_activity(INTEGER) IS 'Returns recent deck activity across all users (admin function)';
