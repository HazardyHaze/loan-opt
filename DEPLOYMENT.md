# Deploying Loan Scholar Opt to DigitalOcean

This guide covers deploying both the Nuxt 4 frontend and Node.js backend to DigitalOcean.

## Architecture Overview

- **Frontend**: Nuxt 4 (Vue 3) application
- **Backend**: Node.js Telegram Scraper service
- **Database**: Supabase (managed)
- **Deployment**: DigitalOcean App Platform (recommended) or Droplets

## Option 1: DigitalOcean App Platform (Recommended)

### Prerequisites

1. DigitalOcean account
2. GitHub repository with your code
3. Supabase database URL and API keys

### Step 1: Prepare Your Repository

Ensure your repository structure includes:
```
loan-scholar-opt/
├── frontend/
│   ├── .env.production
│   ├── package.json
│   ├── nuxt.config.ts
│   └── ...
├── backend/
│   └── telegram-scraper/
│       ├── .env.production
│       ├── package.json
│       └── ...
├── app.yaml (root level for App Platform)
└── README.md
```

### Step 2: Create Environment Files

Create `.env.production` files for each service (don't commit actual secrets, use DigitalOcean environment variables instead):

**Frontend (.env.production):**
```
NUXT_PUBLIC_SUPABASE_URL=your_supabase_url
NUXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NUXT_API_BASE_URL=https://api.yourdomain.com
```

**Backend (.env.production):**
```
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_service_key
TELEGRAM_API_ID=your_telegram_api_id
TELEGRAM_API_HASH=your_telegram_api_hash
PORT=3001
NODE_ENV=production
```

### Step 3: Deploy via DigitalOcean Dashboard

1. Go to [cloud.digitalocean.com/apps](https://cloud.digitalocean.com/apps)
2. Click "Create Apps" → "GitHub" → Select your repository
3. Configure auto-deploy settings
4. The platform should auto-detect the services based on `app.yaml`

### Step 4: Configure Services

Two microservices will be created automatically:

**Frontend Service:**
- Build command: `npm run build`
- Run command: `npm start`
- Environment variables: NUXT_PUBLIC_* variables

**Backend Service:**
- Build command: `npm install`
- Run command: `npm start`
- Environment variables: All backend vars

## Option 2: DigitalOcean Droplets (Manual Setup)

### Frontend Deployment

1. **SSH into your droplet:**
   ```bash
   ssh root@your_droplet_ip
   ```

2. **Install Node.js and npm:**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Clone repository and build:**
   ```bash
   cd /var/www
   git clone https://github.com/yourusername/loan-scholar-opt.git
   cd loan-scholar-opt/frontend
   npm install
   npm run build
   ```

4. **Install PM2:**
   ```bash
   npm install -g pm2
   ```

5. **Start Nuxt with PM2:**
   ```bash
   cd /var/www/loan-scholar-opt/frontend
   pm2 start "npm start" --name "loan-frontend" --instances max
   pm2 save
   pm2 startup
   ```

6. **Setup Nginx reverse proxy:**
   ```bash
   sudo apt-get install -y nginx
   ```

   Create `/etc/nginx/sites-available/loan-frontend`:
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com www.yourdomain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   Enable the config:
   ```bash
   sudo ln -s /etc/nginx/sites-available/loan-frontend /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

### Backend Deployment

1. **On the same droplet:**
   ```bash
   cd /var/www/loan-scholar-opt/backend/telegram-scraper
   npm install
   ```

2. **Create `.env.production` with your credentials**

3. **Start with PM2:**
   ```bash
   pm2 start src/index.js --name "loan-backend" --instances 1 --env production
   pm2 save
   ```

4. **Setup Nginx for API:**
   ```nginx
   server {
       listen 80;
       server_name api.yourdomain.com;

       location / {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
       }
   }
   ```

### Enable HTTPS (SSL/TLS)

Install Certbot:
```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com
```

## Environment Variables Reference

### Frontend (.env.production)

| Variable | Description |
|----------|-------------|
| `NUXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NUXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase public anon key |
| `NUXT_API_BASE_URL` | Backend API base URL |

### Backend (.env.production)

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_KEY` | Supabase service role key (secret) |
| `TELEGRAM_API_ID` | From Telegram Developer Portal |
| `TELEGRAM_API_HASH` | From Telegram Developer Portal |
| `PORT` | Service port (default: 3001) |
| `NODE_ENV` | Set to "production" |

## Database Setup

1. Ensure Supabase project is created and running
2. Run migrations (if you have Prisma setup):
   ```bash
   npx prisma migrate deploy
   ```
3. Store connection string securely in DigitalOcean secrets

## Monitoring & Logs

### App Platform
- Logs available in DigitalOcean console
- Health checks configured automatically

### Droplets with PM2
```bash
pm2 logs loan-frontend
pm2 logs loan-backend
pm2 monit
```

## Scaling Recommendations

- **Frontend**: Enable auto-scaling (1-3 replicas)
- **Backend**: 1-2 instances (depends on Telegram traffic)
- **Database**: Use Supabase's built-in scaling

## Troubleshooting

1. **Frontend won't build**: Check Node.js version compatibility (need 18+)
2. **Backend connection issues**: Verify environment variables and Supabase access
3. **CORS errors**: Configure CORS in Nuxt middleware
4. **Memory issues**: Increase droplet size or use App Platform's auto-scaling

## Next Steps

1. Create GitHub repository if not already done
2. Generate Supabase API keys
3. Get Telegram API credentials
4. Deploy via DigitalOcean dashboard or manually to Droplet
5. Configure custom domain and SSL
6. Setup monitoring and alerts
