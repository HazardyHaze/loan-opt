#!/bin/bash

# DigitalOcean Deployment Script for Loan Scholar Opt
# This script sets up everything needed to deploy to DigitalOcean Droplet

set -e

echo "================================"
echo "Loan Scholar Opt - Deployment Setup"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then
   echo -e "${RED}Please run as root (use sudo)${NC}"
   exit 1
fi

echo -e "${YELLOW}Step 1: System Updates${NC}"
apt-get update
apt-get upgrade -y

echo -e "${YELLOW}Step 2: Installing Node.js${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

echo -e "${YELLOW}Step 3: Installing system packages${NC}"
apt-get install -y nginx git curl wget

echo -e "${YELLOW}Step 4: Installing PM2${NC}"
npm install -g pm2

echo -e "${YELLOW}Step 5: Creating application directory${NC}"
mkdir -p /var/www
cd /var/www

# Check if repo is already cloned
if [ ! -d "loan-scholar-opt" ]; then
    echo -e "${YELLOW}Step 6: Cloning repository${NC}"
    git clone https://github.com/YOUR_USERNAME/loan-scholar-opt.git
    cd loan-scholar-opt
else
    echo -e "${YELLOW}Step 6: Pulling latest changes${NC}"
    cd loan-scholar-opt
    git pull origin main
fi

echo -e "${YELLOW}Step 7: Setting up frontend${NC}"
cd frontend
npm install
npm run build

echo -e "${YELLOW}Step 8: Setting up backend${NC}"
cd ../backend/telegram-scraper
npm install

echo -e "${YELLOW}Step 9: Creating environment files${NC}"
# Frontend .env
cat > /var/www/loan-scholar-opt/frontend/.env.production << EOF
NUXT_PUBLIC_SUPABASE_URL=your_supabase_url
NUXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
NUXT_API_BASE_URL=https://api.yourdomain.com
EOF

# Backend .env
cat > /var/www/loan-scholar-opt/backend/telegram-scraper/.env.production << EOF
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_service_key
TELEGRAM_API_ID=your_api_id
TELEGRAM_API_HASH=your_api_hash
PORT=3001
NODE_ENV=production
EOF

echo -e "${RED}IMPORTANT: Update the .env files with your actual credentials!${NC}"
echo -e "${YELLOW}Files to update:${NC}"
echo "  - /var/www/loan-scholar-opt/frontend/.env.production"
echo "  - /var/www/loan-Scholar-opt/backend/telegram-scraper/.env.production"

echo -e "${YELLOW}Step 10: Starting applications with PM2${NC}"
cd /var/www/loan-scholar-opt/frontend
pm2 start "npm start" --name "loan-frontend" --instances max
pm2 save
pm2 startup systemd -u root --hp /root

cd /var/www/loan-Scholar-opt/backend/telegram-scraper
pm2 start src/index.js --name "loan-backend" --instances 1 --env production

echo -e "${YELLOW}Step 11: Setting up Nginx${NC}"
# Backup original nginx config
cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.backup

# Create frontend config
cat > /etc/nginx/sites-available/loan-frontend << 'EOF'
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
        
        # Add security headers
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
}
EOF

# Create backend config
cat > /etc/nginx/sites-available/loan-backend << 'EOF'
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # Add security headers
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
}
EOF

# Enable sites
ln -sf /etc/nginx/sites-available/loan-frontend /etc/nginx/sites-enabled/
ln -sf /etc/nginx/sites-available/loan-backend /etc/nginx/sites-enabled/

# Remove default site
rm -f /etc/nginx/sites-enabled/default

# Test nginx config
nginx -t

# Restart nginx
systemctl restart nginx

echo -e "${YELLOW}Step 12: Installing SSL (Certbot)${NC}"
apt-get install -y certbot python3-certbot-nginx

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Installation Complete!${NC}"
echo -e "${GREEN}================================${NC}"

echo -e "${YELLOW}Next steps:${NC}"
echo "1. Update environment files with your credentials:"
echo "   - Frontend: /var/www/loan-Scholar-opt/frontend/.env.production"
echo "   - Backend: /var/www/loan-Scholar-opt/backend/telegram-scraper/.env.production"
echo ""
echo "2. Update Nginx configs with your domain:"
echo "   - /etc/nginx/sites-available/loan-frontend"
echo "   - /etc/nginx/sites-available/loan-backend"
echo ""
echo "3. Install SSL certificate:"
echo "   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com"
echo ""
echo "4. Monitor applications:"
echo "   pm2 logs"
echo "   pm2 monit"
echo ""
echo "5. View PM2 status:"
pm2 status
