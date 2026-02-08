# Environment Variables Setup Guide

This file documents all environment variables needed for deployment.

## Frontend Environment Variables

Create `.env.production` in the `frontend/` directory:

```env
# Supabase Configuration
NUXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NUXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Backend API
NUXT_API_BASE_URL=https://api.yourdomain.com
```

### Frontend Variable Reference

| Variable | Type | Description | Example |
|----------|------|-------------|---------|
| NUXT_PUBLIC_SUPABASE_URL | Public | Supabase project URL | https://abc123.supabase.co |
| NUXT_PUBLIC_SUPABASE_ANON_KEY | Public | Supabase public key | eyJhb... |
| NUXT_API_BASE_URL | Public | Backend API endpoint | https://api.example.com |

## Backend Environment Variables

Create `.env.production` in the `backend/telegram-scraper/` directory:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-service-role-key

# Telegram Configuration
TELEGRAM_API_ID=1234567
TELEGRAM_API_HASH=abcdef1234567890abcdef1234567890

# Server Configuration
PORT=3001
NODE_ENV=production
```

### Backend Variable Reference

| Variable | Type | Description | Example |
|----------|------|-------------|---------|
| SUPABASE_URL | Secret | Supabase project URL | https://abc123.supabase.co |
| SUPABASE_KEY | Secret | Service role key (not anon!) | eyJhb... |
| TELEGRAM_API_ID | Secret | From Telegram Developer portal | 1234567 |
| TELEGRAM_API_HASH | Secret | From Telegram Developer portal | abcdef1234567890abcdef1234567890 |
| PORT | Public | Port to run on | 3001 |
| NODE_ENV | Public | Environment | production |

## Getting Your Credentials

### Supabase Keys

1. Go to [supabase.com](https://supabase.com)
2. Select your project
3. Settings → API
4. Copy:
   - `Project URL` → SUPABASE_URL
   - `anon` key → NUXT_PUBLIC_SUPABASE_ANON_KEY
   - `service_role` key → SUPABASE_KEY

### Telegram API Credentials

1. Go to [my.telegram.org](https://my.telegram.org)
2. Select "API development tools"
3. Create an app or use existing
4. Copy:
   - `api_id` → TELEGRAM_API_ID
   - `api_hash` → TELEGRAM_API_HASH

## DigitalOcean App Platform Setup

In the DigitalOcean dashboard:

1. Go to Apps → Create App → Select your GitHub repo
2. For each service, add environment variables:

**Frontend Service:**
- Add all `NUXT_PUBLIC_*` variables

**Backend Service:**
- Add all other variables

**Important:** All keys containing "KEY" or "HASH" should be marked as **secret** in DigitalOcean.

## Local Development

For local development, create `.env`:

```env
NUXT_PUBLIC_SUPABASE_URL=your_dev_url
NUXT_PUBLIC_SUPABASE_ANON_KEY=your_dev_key
NUXT_API_BASE_URL=http://localhost:3001
```

## Production Security

⚠️ **CRITICAL:**
- Never commit `.env.production` to git
- Use `.env.production.example` as a template
- Store all secrets in DigitalOcean's secret management
- Rotate keys regularly
- Use different keys for dev/staging/production

## Verifying Setup

After deployment, verify variables are set:

```bash
# SSH into droplet or use App Platform logs
echo $SUPABASE_URL
echo $NUXT_PUBLIC_SUPABASE_URL
```

## Troubleshooting

**Frontend won't connect to Supabase:**
- Check NUXT_PUBLIC_SUPABASE_URL format (must include https://)
- Verify anon key is correct and not service role key
- Check CORS settings in Supabase project

**Backend can't access Supabase:**
- Verify you're using service_role key, not anon key
- Check SUPABASE_URL matches your project
- Ensure service role key has required permissions

**API calls fail:**
- Check NUXT_API_BASE_URL points to correct backend
- Verify CORS is configured on backend
- Check backend is actually running on specified PORT
