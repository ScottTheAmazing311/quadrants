# Deployment Guide

## Quick Start

The Quadrants application is now fully built and ready to deploy! Follow these steps to get it running.

## Prerequisites

- A Supabase account (free tier works fine)
- A Vercel account (optional, for deployment)
- Node.js 18+ installed locally

## Step 1: Set Up Supabase

### Create a New Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in:
   - Project name: `quadrants` (or any name)
   - Database password: (generate a strong password)
   - Region: (choose closest to your users)
4. Wait for the project to be created (~2 minutes)

### Run Database Migrations

1. In your Supabase project dashboard, click "SQL Editor" in the left sidebar
2. Click "New Query"
3. Copy the entire contents of `supabase/schema.sql`
4. Paste into the SQL editor and click "Run"
5. You should see "Success. No rows returned"

### Add Seed Data

1. Create another new query
2. Copy the entire contents of `supabase/seed.sql`
3. Paste and click "Run"
4. You should see "Success. 50 rows returned" (or similar)

### Set Up Storage

1. Click "Storage" in the left sidebar
2. Click "New bucket"
3. Name: `avatars`
4. Public bucket: **Yes** ✓
5. Click "Create bucket"

### Get API Credentials

1. Click "Settings" (gear icon) in the left sidebar
2. Click "API" under Project Settings
3. Copy these two values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon/public key** (long string starting with `eyJ...`)

## Step 2: Configure Environment Variables

### Local Development

1. In your project root, copy the example file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and replace the placeholder values:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-actual-key
   ```

### For Vercel Deployment

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click "New Project"
4. Import your GitHub repository
5. In the "Environment Variables" section, add:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase anon key
6. Click "Deploy"

## Step 3: Test the Application

### Local Testing

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and test:

1. ✓ Home page loads
2. ✓ Click "Create a Quad" → create a quiz
3. ✓ Click "Join a Group" → create a group
4. ✓ Copy the group code
5. ✓ Open incognito window, join with the code
6. ✓ Play a quad as multiple players
7. ✓ View results on the quadrant grid
8. ✓ Check analysis/superlatives page

### Production Testing

After deploying to Vercel, repeat the same tests on your live URL.

## Common Issues

### "fetch failed" error during build

This is expected if you're building with placeholder Supabase credentials. The build will still succeed. Just make sure to set real credentials before deploying.

### Avatar uploads failing

1. Check that the `avatars` bucket exists in Supabase Storage
2. Verify the bucket is set to **Public**
3. Check that your Supabase URL and key are correct

### "Group not found" error

The group code is case-sensitive and must be exactly 6 characters. Make sure you're copying the full code.

### Database queries failing

1. Verify you ran BOTH `schema.sql` and `seed.sql`
2. Check the SQL Editor for any error messages
3. Ensure RLS (Row Level Security) policies were created correctly

## Performance Optimization

### Database Indexes

The schema already includes indexes on frequently queried columns. If you experience slow queries with large datasets, check the Supabase dashboard's "Database" → "Performance" section.

### Image Optimization

Avatar images are stored as-is in Supabase Storage. For better performance at scale:

1. Add image compression before upload (in `lib/upload.ts`)
2. Use Supabase's image transformation API
3. Consider implementing a CDN

### Caching

For production, consider adding:
- Redis for session/player data caching
- Next.js ISR (Incremental Static Regeneration) for public quads
- Service worker for offline support

## Monitoring

### Supabase Dashboard

Monitor:
- Database size (free tier: 500MB)
- Storage size (free tier: 1GB)
- Bandwidth usage
- Active connections

### Vercel Dashboard

Monitor:
- Build times
- Function execution time
- Edge network requests
- Error rates

## Scaling Considerations

The current implementation should handle:
- ✓ 100s of groups
- ✓ 1000s of players
- ✓ 10,000s of responses

For larger scale:
- Enable connection pooling in Supabase
- Add database read replicas
- Implement rate limiting
- Add pagination to quad lists

## Security Notes

### Current Security Model

- No authentication (by design)
- Players identified by localStorage only
- All data is publicly readable (RLS allows all)
- Group codes are the only "secret"

### If Adding Authentication

To add user accounts later:
1. Enable Supabase Auth
2. Update RLS policies to check auth.uid()
3. Link players table to auth.users
4. Add login/signup flows

## Support

For issues:
1. Check the browser console for errors
2. Check Supabase logs (Dashboard → Logs)
3. Check Vercel function logs
4. Review the README.md for architecture details

---

**You're all set!** 🎉

Your Quadrants application is ready to use. Enjoy discovering how you and your friends align!
