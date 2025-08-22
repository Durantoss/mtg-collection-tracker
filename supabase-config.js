// Supabase Configuration for MTG Collection Tracker
// This file will contain your Supabase project credentials

// You'll need to replace these with your actual Supabase project details
// after setting up your Supabase project at https://supabase.com

const SUPABASE_CONFIG = {
    url: 'https://nqbqdpyaxpgrbrjklybb.supabase.co', // Your project URL
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xYnFkcHlheHBncmJyamtseWJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4ODA4MTAsImV4cCI6MjA3MTQ1NjgxMH0.7Gifr88lgDWAxRnBnrdMQ4qtY9X2M46e0cNA2KAtXVw', // Your anon key
    
    // Database table names
    tables: {
        profiles: 'profiles',
        collections: 'collections',
        inviteCodes: 'invite_codes'
    },
    
    // Admin user details
    admin: {
        email: 'emwilkerson@gmail.com',
        username: 'Durantoss_Anomaly',
        // Password will be set during registration: GeigerBomba11
    }
};

// Initialize Supabase client (will be loaded after Supabase library)
let supabase = null;

// Initialize Supabase when the library is loaded
function initializeSupabase() {
    if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
        supabase = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
        console.log('Supabase initialized successfully');
        return true;
    } else if (typeof createClient !== 'undefined') {
        supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
        console.log('Supabase initialized successfully');
        return true;
    } else {
        console.error('Supabase library not loaded');
        return false;
    }
}

// Authentication helper functions
const Auth = {
    // Check if user is logged in
    async getCurrentUser() {
        if (!supabase) return null;
        const { data: { user } } = await supabase.auth.getUser();
        return user;
    },

    // Get user profile with admin status
    async getUserProfile(userId) {
        if (!supabase) return null;
        const { data, error } = await supabase
            .from(SUPABASE_CONFIG.tables.profiles)
            .select('*')
            .eq('id', userId)
            .single();
        
        if (error) {
            console.error('Error fetching user profile:', error);
            return null;
        }
        return data;
    },

    // Sign in user
    async signIn(email, password) {
        if (!supabase) throw new Error('Supabase not initialized');
        
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) throw error;
        return data;
    },

    // Sign up user with invite code
    async signUp(email, password, username, inviteCode) {
        if (!supabase) throw new Error('Supabase not initialized');

        // First verify the invite code
        const { data: invite, error: inviteError } = await supabase
            .from(SUPABASE_CONFIG.tables.inviteCodes)
            .select('*')
            .eq('code', inviteCode)
            .eq('is_used', false)
            .single();

        if (inviteError || !invite) {
            throw new Error('Invalid or expired invite code');
        }

        // Check if invite is expired
        if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
            throw new Error('Invite code has expired');
        }

        // Sign up the user
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    username: username,
                    invite_code: inviteCode
                }
            }
        });

        if (error) throw error;

        // Mark invite code as used
        if (data.user) {
            await supabase
                .from(SUPABASE_CONFIG.tables.inviteCodes)
                .update({ 
                    is_used: true, 
                    used_by: data.user.id,
                    used_at: new Date().toISOString()
                })
                .eq('code', inviteCode);
        }

        return data;
    },

    // Sign out user
    async signOut() {
        if (!supabase) return;
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    },

    // Listen for auth state changes
    onAuthStateChange(callback) {
        if (!supabase) return;
        return supabase.auth.onAuthStateChange(callback);
    }
};

// Database helper functions
const Database = {
    // Get user's collection
    async getUserCollection(userId) {
        if (!supabase) return [];
        
        const { data, error } = await supabase
            .from(SUPABASE_CONFIG.tables.collections)
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching collection:', error);
            return [];
        }
        return data || [];
    },

    // Add card to collection
    async addCard(userId, cardData) {
        if (!supabase) throw new Error('Supabase not initialized');

        const { data, error } = await supabase
            .from(SUPABASE_CONFIG.tables.collections)
            .insert([{
                user_id: userId,
                card_name: cardData.name,
                set_name: cardData.set,
                set_code: cardData.setCode,
                quantity: cardData.quantity || 1,
                condition: cardData.condition,
                is_foil: cardData.isFoil || false,
                purchase_price: cardData.purchasePrice,
                current_price: cardData.currentPrice,
                notes: cardData.notes,
                image_url: cardData.imageUrl
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Update card in collection
    async updateCard(cardId, updates) {
        if (!supabase) throw new Error('Supabase not initialized');

        const { data, error } = await supabase
            .from(SUPABASE_CONFIG.tables.collections)
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('id', cardId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Delete card from collection
    async deleteCard(cardId) {
        if (!supabase) throw new Error('Supabase not initialized');

        const { error } = await supabase
            .from(SUPABASE_CONFIG.tables.collections)
            .delete()
            .eq('id', cardId);

        if (error) throw error;
    },

    // Sync local collection to database
    async syncLocalCollection(userId, localCollection) {
        if (!supabase || !localCollection.length) return;

        const cardsToInsert = localCollection.map(card => ({
            user_id: userId,
            card_name: card.name,
            set_name: card.set,
            set_code: card.setCode,
            quantity: card.quantity || 1,
            condition: card.condition,
            is_foil: card.isFoil || false,
            purchase_price: card.purchasePrice,
            current_price: card.prices?.scryfall?.price,
            notes: card.notes,
            image_url: card.imageUrl
        }));

        const { data, error } = await supabase
            .from(SUPABASE_CONFIG.tables.collections)
            .insert(cardsToInsert)
            .select();

        if (error) {
            console.error('Error syncing local collection:', error);
            throw error;
        }

        return data;
    }
};

// Admin functions
const Admin = {
    // Generate invite code
    async generateInviteCode(adminUserId, expiresInDays = 7) {
        if (!supabase) throw new Error('Supabase not initialized');

        const code = Math.random().toString(36).substring(2, 15) + 
                    Math.random().toString(36).substring(2, 15);
        
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + expiresInDays);

        const { data, error } = await supabase
            .from(SUPABASE_CONFIG.tables.inviteCodes)
            .insert([{
                code: code.toUpperCase(),
                created_by: adminUserId,
                expires_at: expiresAt.toISOString()
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Get all users (admin only)
    async getAllUsers() {
        if (!supabase) return [];

        const { data, error } = await supabase
            .from(SUPABASE_CONFIG.tables.profiles)
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching users:', error);
            return [];
        }
        return data || [];
    },

    // Get all invite codes (admin only)
    async getAllInviteCodes() {
        if (!supabase) return [];

        const { data, error } = await supabase
            .from(SUPABASE_CONFIG.tables.inviteCodes)
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching invite codes:', error);
            return [];
        }
        return data || [];
    },

    // Deactivate user (admin only)
    async deactivateUser(userId) {
        if (!supabase) throw new Error('Supabase not initialized');

        const { data, error } = await supabase
            .from(SUPABASE_CONFIG.tables.profiles)
            .update({ is_active: false })
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SUPABASE_CONFIG, Auth, Database, Admin, initializeSupabase };
}
