# DigitalOcean Redeployment Guide

The error "failed to launch: determine start command" has been fixed by:

1. ✅ Added `start` script to frontend `package.json`
2. ✅ Created `Procfile` for DigitalOcean
3. ✅ Updated `app.yaml` with correct commands

## Redeployment Steps

### Option 1: If using DigitalOcean App Platform

1. **Commit and push changes:**
   ```bash
   git add -A
   git commit -m "Fix: Add start scripts and Procfile for DigitalOcean deployment"
   git push origin main
   ```

2. **Trigger redeploy in DigitalOcean Dashboard:**
   - Go to cloud.digitalocean.com/apps
   - Select your app "loan-opt"
   - Click "Deploy" or "Redeploy"
   - The platform will automatically detect the new commands

3. **Monitor the deployment:**
   - Watch logs in the dashboard
   - Should see "Building frontend..." then "Running npm start"

### Option 2: If using DigitalOcean Droplet

1. **SSH into your droplet:**
   ```bash
   ssh root@your-droplet-ip
   ```

2. **Pull latest changes:**
   ```bash
   cd /var/www/loan-Scholar-opt
   git pull origin main
   ```

3. **Rebuild frontend:**
   ```bash
   cd frontend
   npm install
   npm run build
   pm2 restart loan-frontend
   ```

4. **Check status:**
   ```bash
   pm2 status
   pm2 logs loan-frontend
   ```

## What Was Fixed

### Frontend package.json
Added the `start` script:
```json
"start": "node .output/server/index.mjs"
```

This tells DigitalOcean exactly how to start the Nuxt application after building.

### Procfile
Created process file for Heroku-like deployment:
```
web: npm --prefix frontend run build && npm --prefix frontend start
api: npm --prefix backend/telegram-scraper start
scheduler: npm --prefix backend/telegram-scraper run schedule
```

### app.yaml
Updated commands to use proper npm prefix syntax instead of cd commands:
```yaml
build_command: npm --prefix frontend run build
run_command: npm --prefix frontend start
```

## Troubleshooting

If you still see deployment errors:

1. **Check build output:**
   ```
   View App Logs → Build Logs
   ```

2. **Verify environment variables are set:**
   - NUXT_PUBLIC_SUPABASE_URL
   - NUXT_PUBLIC_SUPABASE_ANON_KEY
   - NUXT_API_BASE_URL

3. **Test locally first:**
   ```bash
   npm run build
   npm start
   ```

4. **Check Procfile syntax:**
   ```bash
   cat Procfile
   ```

## Status Commands

**Check frontend build output:**
```bash
npm --prefix frontend run build
```

**Test frontend start:**
```bash
npm --prefix frontend start
```

**Expected output:**
```
> loan-scholar-opt@1.0.0 start
> node .output/server/index.mjs

Listening on http://localhost:3000
```

If the frontend starts successfully locally, it will work on DigitalOcean.
