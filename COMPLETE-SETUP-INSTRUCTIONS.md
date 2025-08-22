# MTG Collection Tracker - Complete Setup Instructions

## Overview
This guide will walk you through setting up the complete MTG Collection Tracker with Supabase authentication, invite-only registration, and admin controls.

## Prerequisites
- Supabase account (https://supabase.com)
- The MTG Collection Tracker files
- A web browser
- Basic understanding of copy/paste operations

## Step-by-Step Setup

### 1. Verify Your Supabase Project
Your Supabase project should already be configured with these credentials:
- **Project URL**: `https://nqbqdpyaxpgrbrjklybb.supabase.co`
- **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 2. Set Up the Database Schema

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project: `mtg-collection-tracker`
3. Navigate to **SQL Editor** in the left sidebar
4. Click **"New query"**
5. Copy the entire contents of `database-setup-simple.sql` and paste it into the editor
6. Click **"Run"** to execute the SQL commands
7. You should see "Success. No rows returned" if everything worked correctly

### 3. Generate the 15 Invite Codes

1. In the same **SQL Editor**, create a new query
2. Copy the entire contents of `generate-invite-codes.sql` and paste it into the editor
3. Click **"Run"** to execute the SQL commands
4. You should see 15 new invite codes generated in the output
5. **IMPORTANT**: Copy and save these invite codes - you'll need them for user registration

### 4. Verify Database Setup

1. Go to **Table Editor** in your Supabase dashboard
2. You should see three new tables:
   - `profiles` - User profiles with admin flags
   - `collections` - User card collections  
   - `invite_codes` - Invitation codes for registration
3. Click on the `invite_codes` table to verify your 15 codes were created
4. You should see 16 total codes (15 new ones + 1 admin setup code)

### 5. Configure Authentication Settings

1. Go to **Authentication** → **Settings** in your Supabase dashboard
2. Under **Auth Settings**:
   - **Enable email confirmations**: Turn **OFF** (for easier testing)
   - **Enable phone confirmations**: Turn **OFF**
3. Under **URL Configuration**:
   - **Site URL**: `http://localhost:8000` (for testing)
   - **Redirect URLs**: Add `http://localhost:8000` and any production URLs

### 6. Test the Application

1. Start your local server:
   ```bash
   python serve.py
   ```
2. Open your browser to `http://localhost:8000`
3. The app should load without errors
4. Check the browser console (F12) - you should see "Supabase initialized successfully"

### 7. Create the Admin Account

1. On the app homepage, you should see a login prompt
2. Click **"Sign In"** then **"Don't have an account? Register here"**
3. Register with these exact details:
   - **Email**: `emwilkerson@gmail.com`
   - **Username**: `Durantoss_Anomaly`
   - **Password**: `GeigerBomba11`
   - **Invite Code**: `ADMIN-SETUP-2025`
4. Click **"Register"**
5. You should see "Account created successfully! Please sign in."
6. Now sign in with the same email and password

### 8. Verify Admin Setup

1. After signing in, you should see a user menu in the top right
2. If you're the admin, you should see an **"Admin Panel"** button
3. Click **"Admin Panel"** to open the admin interface
4. You should see:
   - **Users tab**: Shows your admin account
   - **Invite Codes tab**: Shows all 16 invite codes (1 used, 15 available)
   - **Stats tab**: Shows system statistics

### 9. Generate Additional Invite Codes (Optional)

1. In the Admin Panel, go to the **Invite Codes** tab
2. Click **"Generate New Invite Code"**
3. A new code will be created and displayed
4. You can generate more codes as needed

## Your 15 Invite Codes

After running the setup, you'll have 15 unique invite codes. Here's how to find them:

1. Go to your Supabase dashboard
2. Navigate to **Table Editor** → **invite_codes**
3. You'll see all codes with their status
4. Share the unused codes with your intended users

## User Registration Process

For each of your 15 users:

1. Give them one of the unused invite codes
2. They visit your app URL
3. They click **"Sign In"** → **"Register here"**
4. They fill out the registration form with their invite code
5. After registration, they can sign in and start using the app

## Features Available

### For All Users:
- Add cards to their personal collection
- Search for MTG cards using Scryfall API
- View card prices from multiple sources
- Filter and search their collection
- Access MTG rules and dictionary
- Offline functionality (PWA)

### For Admin Only:
- View all users and their status
- See all invite codes and usage
- Generate new invite codes
- View system statistics
- Manage user accounts

## Security Features

- **Row Level Security (RLS)**: Users can only see their own data
- **Invite-Only Registration**: No public registration
- **User Limit**: Maximum 15 active users (plus admin)
- **Admin Controls**: Special permissions for user management
- **Secure Authentication**: Powered by Supabase Auth

## Troubleshooting

### Common Issues:

1. **"Supabase not initialized" error**
   - Check that your Supabase credentials are correct in `supabase-config.js`
   - Ensure you're accessing the app via HTTP/HTTPS (not file://)

2. **Database errors**
   - Verify all SQL scripts ran successfully
   - Check that RLS policies were created
   - Ensure tables exist in Supabase dashboard

3. **Invite code not working**
   - Check the code exists in the `invite_codes` table
   - Verify the code hasn't been used already
   - Make sure the code hasn't expired

4. **Admin panel not showing**
   - Verify the admin user has `is_admin = true` in the `profiles` table
   - Check that you're signed in with the correct admin account

### SQL Queries for Debugging:

```sql
-- Check all users
SELECT * FROM profiles ORDER BY created_at DESC;

-- Check invite codes
SELECT code, is_used, used_by, expires_at FROM invite_codes ORDER BY created_at DESC;

-- Check user collections count
SELECT p.username, COUNT(c.*) as card_count 
FROM profiles p 
LEFT JOIN collections c ON p.id = c.user_id 
GROUP BY p.id, p.username;

-- Reset an invite code (if needed)
UPDATE invite_codes SET is_used = false, used_by = null, used_at = null WHERE code = 'YOUR-CODE-HERE';
```

## Production Deployment

When ready for production:

1. **Update URLs**: Change localhost URLs to your production domain
2. **Enable HTTPS**: Required for PWA functionality
3. **Update Supabase settings**: Add production URLs to redirect URLs
4. **Enable email confirmations**: For added security
5. **Set up custom domain**: Optional but recommended

## Support

If you encounter issues:

1. Check the browser console for error messages
2. Verify your Supabase dashboard for data
3. Test with a fresh browser session
4. Review the SQL execution results

## Next Steps

After setup is complete:

1. Test the complete user flow with a test invite code
2. Verify all features work correctly
3. Add cards to test the collection functionality
4. Test the PWA installation on mobile devices
5. Deploy to production when ready

---

**Important Notes:**
- Keep your Supabase credentials secure
- Save your invite codes in a safe place
- Test thoroughly before sharing with users
- Monitor usage through the admin panel

Your MTG Collection Tracker is now ready for use with 15 invite-only user slots and full admin controls!
