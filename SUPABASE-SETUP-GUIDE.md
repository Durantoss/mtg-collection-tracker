# MTG Collection Tracker - Supabase Setup Guide

This guide will walk you through setting up Supabase for the MTG Collection Tracker with authentication, private collections, and admin controls.

## Prerequisites

- A Supabase account (sign up at https://supabase.com)
- Basic understanding of SQL and database concepts

## Step 1: Create a New Supabase Project

1. Go to https://supabase.com and sign in to your account
2. Click "New Project"
3. Choose your organization
4. Fill in project details:
   - **Name**: `mtg-collection-tracker`
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose the closest region to your users
5. Click "Create new project"
6. Wait for the project to be created (this may take a few minutes)

## Step 2: Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (something like `https://your-project-id.supabase.co`)
   - **anon public key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

## Step 3: Update Your Configuration

1. Open `supabase-config.js` in your project
2. Replace the placeholder values:
   ```javascript
   const SUPABASE_CONFIG = {
       url: 'https://your-project-id.supabase.co', // Your Project URL
       anonKey: 'your-anon-key-here', // Your anon public key
       // ... rest of config stays the same
   };
   ```

## Step 4: Set Up the Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy the entire contents of `supabase-setup.sql` and paste it into the editor
4. Click "Run" to execute the SQL commands
5. You should see "Success. No rows returned" if everything worked correctly

## Step 5: Verify Database Setup

1. Go to **Table Editor** in your Supabase dashboard
2. You should see three new tables:
   - `profiles` - User profiles with admin flags
   - `collections` - User card collections
   - `invite_codes` - Invitation codes for registration
3. Check that Row Level Security (RLS) is enabled on all tables

## Step 6: Configure Authentication

1. Go to **Authentication** → **Settings** in your Supabase dashboard
2. Under **Auth Settings**:
   - **Enable email confirmations**: Turn OFF (for easier testing)
   - **Enable phone confirmations**: Turn OFF
   - **Enable custom SMTP**: Optional (for production)
3. Under **URL Configuration**:
   - **Site URL**: `https://your-domain.com` (or `http://localhost:8000` for testing)
   - **Redirect URLs**: Add your domain(s)

## Step 7: Test the Initial Setup

1. Start your local server:
   ```bash
   python serve.py
   ```
2. Open your browser to `http://localhost:8000`
3. The app should load without errors
4. Check the browser console - you should see "Supabase initialized successfully"

## Step 8: Create the Admin Account

1. Use the initial invite code `ADMIN-SETUP-2025` to register
2. Register with:
   - **Email**: `emwilkerson@gmail.com`
   - **Username**: `Durantoss_Anomaly`
   - **Password**: `GeigerBomba11`
   - **Invite Code**: `ADMIN-SETUP-2025`
3. This account will automatically be granted admin privileges

## Step 9: Verify Admin Setup

1. After registration, check the `profiles` table in Supabase
2. The admin user should have `is_admin = true`
3. The invite code should be marked as `is_used = true`

## Step 10: Generate Additional Invite Codes

As an admin, you can generate invite codes for other users:

1. Log in as the admin user
2. Access the admin panel (will be implemented in the next steps)
3. Generate invite codes for your 14 additional users
4. Share these codes with your intended users

## Database Schema Overview

### Tables Created

1. **profiles**
   - Extends Supabase auth.users
   - Stores username, admin status, and activity status
   - Automatically created when users sign up

2. **collections**
   - Stores individual card entries for each user
   - Includes card details, condition, prices, and notes
   - Private to each user via Row Level Security

3. **invite_codes**
   - Manages invitation system
   - Tracks usage and expiration
   - Only admins can create new codes

### Security Features

- **Row Level Security (RLS)**: Ensures users can only access their own data
- **User Limit**: Maximum of 15 active users enforced at database level
- **Admin Controls**: Special permissions for user management
- **Invite System**: Registration only possible with valid invite codes

## Environment Variables (Optional)

For production deployment, consider using environment variables:

```javascript
const SUPABASE_CONFIG = {
    url: process.env.SUPABASE_URL || 'your-fallback-url',
    anonKey: process.env.SUPABASE_ANON_KEY || 'your-fallback-key',
    // ...
};
```

## Troubleshooting

### Common Issues

1. **"Supabase not initialized" error**
   - Check that your URL and anon key are correct
   - Ensure the Supabase JavaScript library is loaded

2. **RLS policy errors**
   - Verify that all RLS policies were created successfully
   - Check that users are properly authenticated

3. **Invite code not working**
   - Check that the code exists and hasn't expired
   - Verify the code hasn't already been used

4. **User limit reached**
   - Check the `profiles` table for inactive users
   - Deactivate unused accounts if needed

### SQL Queries for Debugging

```sql
-- Check all users
SELECT * FROM profiles ORDER BY created_at DESC;

-- Check invite codes
SELECT * FROM invite_codes ORDER BY created_at DESC;

-- Check user collections
SELECT p.username, COUNT(c.*) as card_count 
FROM profiles p 
LEFT JOIN collections c ON p.id = c.user_id 
GROUP BY p.id, p.username;

-- Clean up expired invite codes
SELECT cleanup_expired_invites();
```

## Next Steps

After completing this setup:

1. Implement the authentication UI (login/registration forms)
2. Create the admin panel for user management
3. Add collection sync functionality
4. Test the complete user flow
5. Deploy to production

## Security Considerations

- Keep your database password secure
- Use environment variables for production
- Regularly review user access and permissions
- Monitor invite code usage
- Consider enabling email confirmations for production

## Support

If you encounter issues:

1. Check the Supabase dashboard logs
2. Review the browser console for errors
3. Verify your database schema matches the setup
4. Test with a fresh Supabase project if needed

---

**Important**: Save your Supabase credentials securely and never commit them to version control!
