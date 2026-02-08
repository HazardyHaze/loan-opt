# Pre-Deployment Checklist

Complete this checklist before deploying to DigitalOcean.

## Code Preparation

- [ ] All code committed to GitHub
- [ ] No sensitive credentials in code files
- [ ] `.env.production` files added to `.gitignore`
- [ ] Frontend builds successfully: `npm run build`
- [ ] Backend starts successfully: `npm start`
- [ ] Tested locally with actual environment variables

## DigitalOcean Account & Resources

- [ ] DigitalOcean account created
- [ ] Billing method set up
- [ ] New Droplet created (Ubuntu 22.04, 2GB RAM minimum)
  - [ ] SSH key added
  - [ ] Firewall configured (ports 80, 443)
- [ ] Domain registered or transferred
- [ ] Domain nameservers pointing to DigitalOcean
- [ ] Supabase project created and running

## Credentials & Keys

Collect all required credentials:

### Supabase
- [ ] Project URL: `https://xxxxx.supabase.co`
- [ ] Anon Key (public): `eyJhb...`
- [ ] Service Role Key (secret): `eyJhb...`

### Telegram
- [ ] API ID: `1234567`
- [ ] API Hash: `abcdef...`

### Domain
- [ ] Primary domain: `example.com`
- [ ] Subdomain for API: `api.example.com`

## Deployment Choice

### Option A: DigitalOcean App Platform (Recommended)
- [ ] GitHub repository public or authorized
- [ ] `app.yaml` configured with correct service names
- [ ] Environment variables documented
- [ ] Deployment triggers configured

### Option B: DigitalOcean Droplet (Manual)
- [ ] SSH access to Droplet working
- [ ] `deploy.sh` script reviewed and customized
- [ ] `.env.production` files prepared
- [ ] Nginx configuration reviewed

## Deployment Execution

### Using App Platform
1. [ ] Go to cloud.digitalocean.com/apps
2. [ ] Click "Create Apps"
3. [ ] Select GitHub repository
4. [ ] Configure auto-detect or upload `app.yaml`
5. [ ] Add environment variables for both services
6. [ ] Review and deploy

### Using Droplet

1. [ ] SSH into Droplet
   ```bash
   ssh root@<droplet-ip>
   ```

2. [ ] Run deployment script
   ```bash
   curl -sSL https://raw.githubusercontent.com/username/loan-scholar-opt/main/deploy.sh | bash
   ```

3. [ ] Update environment files with credentials
   ```bash
   nano /var/www/loan-scholar-opt/frontend/.env.production
   nano /var/www/loan-Scholar-opt/backend/telegram-scraper/.env.production
   ```

4. [ ] Update Nginx configuration with your domain
   ```bash
   nano /etc/nginx/sites-available/loan-frontend
   nano /etc/nginx/sites-available/loan-backend
   ```

5. [ ] Install SSL certificates
   ```bash
   bash /var/www/loan-scholar-opt/setup-ssl.sh example.com
   ```

6. [ ] Verify services are running
   ```bash
   pm2 status
   pm2 logs
   ```

## Post-Deployment Verification

- [ ] Frontend accessible at `https://example.com`
- [ ] Frontend loads without CORS errors
- [ ] Backend accessible at `https://api.example.com`
- [ ] Backend health check responds: `curl https://api.example.com/health`
- [ ] Database connections working
- [ ] Telegram service running and authenticated
- [ ] Logs show no errors: `pm2 logs`

## Monitoring & Maintenance

- [ ] Set up PM2 monitoring: `pm2 web`
- [ ] Configure Nginx error monitoring
- [ ] Set up database backups in Supabase
- [ ] Enable auto-renewal for SSL certificates
- [ ] Monitor disk space usage
- [ ] Monitor memory and CPU usage
- [ ] Set up email alerts for errors

## Security Hardening

- [ ] Firewall configured (UFW):
  ```bash
  ufw allow 22/tcp
  ufw allow 80/tcp
  ufw allow 443/tcp
  ufw enable
  ```
- [ ] Fail2ban installed and configured
- [ ] SSH port changed from default (optional but recommended)
- [ ] SSH key-only authentication enabled
- [ ] Regular security updates configured: `apt install unattended-upgrades`
- [ ] CORS headers configured correctly
- [ ] Rate limiting enabled in Nginx
- [ ] DDoS protection enabled in DigitalOcean console

## Rollback Plan

If something goes wrong:

1. [ ] Previous version backed up in Git
2. [ ] Database backups available in Supabase
3. [ ] PM2 restart procedures documented
4. [ ] Nginx configuration backups created
5. [ ] Quick restore script prepared

## Ongoing Operations

- [ ] Monitor logs daily: `pm2 logs`
- [ ] Check disk usage: `df -h`
- [ ] Review Nginx error logs: `tail -f /var/log/nginx/error.log`
- [ ] Update dependencies regularly: `npm update`
- [ ] Monitor Supabase usage and billing
- [ ] Keep OS updated: `apt upgrade`

## Support Contacts

- [ ] DigitalOcean Support: https://support.digitalocean.com
- [ ] Supabase Documentation: https://supabase.com/docs
- [ ] Telegram API Help: https://core.telegram.org/
- [ ] Your team members notified of deployment

---

**Deployment Date:** ___________
**Deployed By:** ___________
**Notes:** ___________
