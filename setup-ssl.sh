#!/bin/bash

# SSL Certificate Setup Script
# Usage: ./setup-ssl.sh <domain>

if [ $# -ne 1 ]; then
    echo "Usage: $0 <domain>"
    echo "Example: $0 example.com"
    exit 1
fi

DOMAIN=$1

echo "Setting up SSL certificates for: $DOMAIN"
echo ""

# Check if certbot is installed
if ! command -v certbot &> /dev/null; then
    echo "Installing Certbot..."
    apt-get update
    apt-get install -y certbot python3-certbot-nginx
fi

echo "Requesting SSL certificates..."
certbot --nginx \
    -d $DOMAIN \
    -d www.$DOMAIN \
    -d api.$DOMAIN \
    --non-interactive \
    --agree-tos \
    -m admin@$DOMAIN

echo ""
echo "SSL Setup Complete!"
echo ""
echo "Certificates installed for:"
echo "  - $DOMAIN"
echo "  - www.$DOMAIN"
echo "  - api.$DOMAIN"
echo ""
echo "Auto-renewal is enabled. Certbot will renew certificates automatically."
echo ""
echo "Verify SSL:"
echo "  curl -I https://$DOMAIN"
echo "  curl -I https://api.$DOMAIN"
