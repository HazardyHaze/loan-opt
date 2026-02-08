#!/bin/bash

# Quick deployment script for DigitalOcean
# Usage: ./quick-deploy.sh <github-repo-url> <domain>

set -e

if [ $# -lt 2 ]; then
    echo "Usage: $0 <github-repo-url> <domain>"
    echo "Example: $0 https://github.com/user/loan-scholar-opt.git example.com"
    exit 1
fi

REPO_URL=$1
DOMAIN=$2
APP_PATH="/var/www/loan-scholar-opt"

echo "========================================="
echo "Deploying Loan Scholar Opt"
echo "========================================="
echo "Repository: $REPO_URL"
echo "Domain: $DOMAIN"
echo "========================================="

# Pull latest code
echo "Pulling latest code..."
cd $APP_PATH
git pull origin main || git clone $REPO_URL .

# Update frontend
echo "Updating frontend..."
cd $APP_PATH/frontend
npm install
npm run build
pm2 restart loan-frontend || pm2 start "npm start" --name "loan-frontend"

# Update backend
echo "Updating backend..."
cd $APP_PATH/backend/telegram-scraper
npm install
pm2 restart loan-backend || pm2 start src/index.js --name "loan-backend"

# Update Nginx config with domain
echo "Updating Nginx configuration..."
sed -i "s/yourdomain.com/$DOMAIN/g" /etc/nginx/sites-available/loan-frontend
sed -i "s/yourdomain.com/$DOMAIN/g" /etc/nginx/sites-available/loan-backend

# Reload Nginx
nginx -t && systemctl reload nginx

# Save PM2
pm2 save

echo "========================================="
echo "Deployment complete!"
echo "========================================="
echo ""
echo "Frontend: https://$DOMAIN"
echo "Backend: https://api.$DOMAIN"
echo ""
echo "Status:"
pm2 status

echo ""
echo "Logs:"
echo "  Frontend: pm2 logs loan-frontend"
echo "  Backend: pm2 logs loan-backend"
echo "  Nginx: tail -f /var/log/nginx/access.log"
