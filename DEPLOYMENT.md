# Deployment Guide

This guide covers multiple deployment options for the Chicago Health Data Platform.

## Prerequisites

- Node.js 20+
- PostgreSQL database
- Mapbox access token
- Environment variables configured

## Replit Deployment (Recommended)

### Quick Deploy
1. Fork this repository on GitHub
2. Import to Replit from GitHub
3. Configure Secrets in Replit:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `MAPBOX_ACCESS_TOKEN`: Your Mapbox API token
   - `SESSION_SECRET`: Random secure string
4. Click "Deploy" button
5. Your app will be live at `yourapp.replit.app`

### Replit Configuration
The project includes pre-configured Replit files:
- `.replit`: Defines run command and language
- `replit.nix`: Package dependencies
- Automatic HTTPS and custom domain support

## Manual Server Deployment

### Build and Deploy
```bash
# Clone repository
git clone https://github.com/yourusername/chicago-health-data-platform.git
cd chicago-health-data-platform

# Install dependencies
npm install

# Set environment variables
cp .env.example .env
# Edit .env with your configuration

# Build application
npm run build

# Start production server
npm start
```

### Server Requirements
- Node.js 20+
- 2GB+ RAM recommended
- PostgreSQL 13+
- SSL certificate (Let's Encrypt recommended)

## Docker Deployment

### Single Container
```bash
# Build image
docker build -t chicago-health-platform .

# Run container
docker run -p 5000:5000 \
  -e DATABASE_URL="your_db_url" \
  -e MAPBOX_ACCESS_TOKEN="your_token" \
  chicago-health-platform
```

### Docker Compose (with PostgreSQL)
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Cloud Platform Deployment

### Heroku
```bash
# Install Heroku CLI and login
heroku create your-app-name

# Set environment variables
heroku config:set DATABASE_URL="your_postgres_url"
heroku config:set MAPBOX_ACCESS_TOKEN="your_token"
heroku config:set SESSION_SECRET="secure_random_string"

# Deploy
git push heroku main
```

### Railway
1. Connect GitHub repository
2. Set environment variables in Railway dashboard
3. Deploy automatically on push

### Vercel
1. Connect GitHub repository
2. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. Set environment variables
4. Deploy

## Environment Variables

### Required
```env
DATABASE_URL=postgresql://user:password@host:port/database
MAPBOX_ACCESS_TOKEN=pk.eyJ1...
SESSION_SECRET=your-super-secret-key
```

### Optional
```env
NODE_ENV=production
PORT=5000
CENSUS_API_KEY=your-census-key
CHICAGO_DATA_API_KEY=your-chicago-key
```

## Database Setup

### PostgreSQL Configuration
```sql
-- Create database
CREATE DATABASE chicago_health_platform;

-- Create user (optional)
CREATE USER app_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE chicago_health_platform TO app_user;
```

### Schema Migration
```bash
# Apply database schema
npm run db:push

# Verify tables created
psql $DATABASE_URL -c "\dt"
```

## SSL/HTTPS Setup

### Let's Encrypt (Certbot)
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Cloudflare (Recommended)
1. Add domain to Cloudflare
2. Set DNS to proxy through Cloudflare
3. Enable "Always Use HTTPS"
4. Configure SSL/TLS to "Full (strict)"

## Performance Optimization

### Application Level
- Enable gzip compression
- Implement caching headers
- Optimize database queries
- Use CDN for static assets

### Server Level
```nginx
# Nginx configuration
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Monitoring and Logging

### Health Checks
The application provides health check endpoints:
- `/api/health-check`: Basic health status
- `/api/status`: Detailed system information

### Logging
```javascript
// Production logging setup
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### Monitoring Services
- **Uptime Robot**: Free uptime monitoring
- **New Relic**: Application performance monitoring
- **DataDog**: Comprehensive monitoring solution

## Backup Strategy

### Database Backups
```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL > backup_${DATE}.sql

# Upload to cloud storage
aws s3 cp backup_${DATE}.sql s3://your-backup-bucket/
```

### File Backups
- Geographic data files in `server/data/`
- Configuration files
- SSL certificates

## Security Checklist

- [ ] Environment variables secured
- [ ] Database credentials rotated
- [ ] HTTPS enabled
- [ ] CORS configured properly
- [ ] Rate limiting implemented
- [ ] Input validation active
- [ ] SQL injection prevention
- [ ] XSS protection enabled

## Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# Find process using port 5000
lsof -i :5000
# Kill process
kill -9 <PID>
```

**Database Connection Failed**
- Verify DATABASE_URL format
- Check database server status
- Confirm network connectivity
- Validate credentials

**Build Failures**
- Clear node_modules and reinstall
- Check Node.js version compatibility
- Verify all dependencies installed

**Map Not Loading**
- Verify MAPBOX_ACCESS_TOKEN
- Check browser console for errors
- Confirm token permissions

### Log Analysis
```bash
# View application logs
tail -f /var/log/your-app.log

# Filter error logs
grep "ERROR" /var/log/your-app.log

# Monitor real-time logs
journalctl -f -u your-app-service
```

## Production Checklist

- [ ] All environment variables configured
- [ ] Database schema applied
- [ ] SSL certificate installed
- [ ] Health checks responding
- [ ] Monitoring configured
- [ ] Backup strategy implemented
- [ ] Error logging active
- [ ] Performance tested
- [ ] Security measures applied
- [ ] Domain configured
- [ ] CDN setup (if applicable)

## Support

For deployment issues:
1. Check this guide first
2. Review application logs
3. Test health check endpoints
4. Create GitHub issue with:
   - Deployment method used
   - Error messages
   - Environment details
   - Steps to reproduce