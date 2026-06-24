# 🚀 LinguaAI Deployment Guide

## Production Readiness Checklist

### ✅ Completed
- [x] Security middleware (Helmet, rate limiting)
- [x] Input validation on all endpoints
- [x] Error handling middleware
- [x] Request logging
- [x] CORS configuration
- [x] Database indexing
- [x] JWT authentication
- [x] Password hashing (bcrypt)

### 📋 Prerequisites

Before deploying to production:

1. **MongoDB Atlas Setup**
   ```bash
   # Create account at https://www.mongodb.com/cloud/atlas
   # Create free M0 cluster
   # Get connection string: mongodb+srv://user:password@cluster.mongodb.net/linguaai
   ```

2. **API Keys**
   - OpenAI: https://platform.openai.com/api-keys
   - Google Gemini: https://ai.google.dev (optional)

3. **Environment Files**
   - Copy `backend/.env.production.example` to `backend/.env.production`
   - Copy `Frontend/.env.production` and update with production URLs
   - Add all credentials and update domains

---

## Option 1: Deploy on Render (Recommended - Best for Full-Stack)

Perfect for applications with both backend and frontend in same repository.

### Quick Start

1. Push code to GitHub
2. Go to https://render.com
3. Connect your repository
4. Create two web services:
   - **Backend**: Set root directory to `backend`, start command `npm run prod`
   - **Frontend**: Set root directory to `Frontend`, build command `npm install && npm run build`
5. Add environment variables (MONGO_URI, OPENAI_API_KEY, etc.)

**👉 [See detailed Render guide](RENDER_DEPLOYMENT.md)**

**Cost**: Free tier available (512 MB RAM, may sleep after inactivity)  
**Setup Time**: ~15 minutes  
**Best For**: Full-stack monorepo deployment

---

## Option 2: Deploy on Vercel (Easiest CLI)

### Backend Deployment (Node.js)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy backend
cd backend
vercel --env-file .env.production

# Set environment variables in Vercel dashboard:
# - MONGO_URI
# - OPENAI_API_KEY
# - JWT_SECRET
# - NODE_ENV=production
```

### Frontend Deployment (React)

```bash
# Deploy frontend
cd Frontend
vercel --env-file .env.production

# The build will automatically run `npm run build`
```

**Cost**: Free tier available (with limits)  
**Setup Time**: ~10 minutes

---

## Option 3: Deploy on Heroku

### Backend Setup

```bash
# Install Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# Login
heroku login

# Create app
heroku create your-app-name

# Add MongoDB addon
heroku addons:create mongolab:sandbox

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET="your-secret-key"
heroku config:set OPENAI_API_KEY="your-key"
heroku config:set ALLOWED_ORIGINS="https://your-frontend-domain.com"

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

### Frontend Setup

```bash
# Option A: Deploy on Netlify (Free)
npm install -g netlify-cli
cd Frontend
netlify deploy --prod

# Option B: Deploy on Heroku
heroku create your-frontend-app-name
git subtree push --prefix Frontend heroku main
```

**Cost**: ~$7/month (after free tier)  
**Setup Time**: ~15 minutes

---

## Option 4: Deploy on Railway

### Setup

```bash
# Install Railway CLI
# https://docs.railway.app/cli/cli-reference

# Login
railway login

# Create project
railway init

# Add MongoDB
railway add --plugin postgresql  # or mongodb plugin

# Set environment variables in dashboard

# Deploy
railway up
```

**Cost**: Pay-as-you-go (~$5-10/month typical)  
**Setup Time**: ~10 minutes

---

## Option 5: Deploy on AWS (EC2)

### Setup Instance

```bash
# Launch EC2 instance (Ubuntu 20.04 LTS - Free tier eligible)

# SSH into instance
ssh -i your-key.pem ubuntu@your-instance-ip

# Install Node.js
curl -sL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 (process manager)
sudo npm install -g pm2

# Clone repository
git clone https://github.com/yourusername/CodeAlpha_LanguageTranslationTool.git
cd CodeAlpha_LanguageTranslationTool/backend

# Install dependencies
npm install

# Create .env with production values
nano .env.production

# Start backend with PM2
pm2 start npm --name "linguaai-backend" -- start
pm2 startup
pm2 save

# Setup frontend (using S3 + CloudFront for static hosting)
cd ../Frontend
npm run build
# Upload dist/ to S3 bucket
```

**Cost**: $0-30/month (Free tier for first year)  
**Setup Time**: ~30 minutes

---

## Production Environment Variables

### Backend (.env.production)

```env
NODE_ENV=production
PORT=443

# Database
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/linguaai

# Authentication
JWT_SECRET=your-secure-64-char-random-string

# API Keys
OPENAI_API_KEY=sk-proj-your-key
GEMINI_API_KEY=your-key

# CORS
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Rate Limiting (adjust based on your traffic)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend (.env.production)

```env
VITE_API_URL=https://api.yourdomain.com
```

---

## Production Checklist Before Going Live

### Security
- [ ] JWT_SECRET is long and random (64+ characters)
- [ ] All API keys are from production accounts
- [ ] CORS origins are restricted to your domain only
- [ ] HTTPS/SSL enabled on all endpoints
- [ ] Rate limiting is configured appropriately
- [ ] Input validation is working on all endpoints
- [ ] No sensitive data in console logs (NODE_ENV=production)
- [ ] Database has authentication enabled
- [ ] Database backups are configured

### Performance
- [ ] Frontend is built with production optimizations
- [ ] Images and assets are optimized
- [ ] Database queries use indexes
- [ ] Compression is enabled on API responses
- [ ] CDN is configured for static assets (optional)

### Monitoring
- [ ] Error logging is set up (Sentry recommended)
- [ ] Server logs are being collected
- [ ] Uptime monitoring is configured
- [ ] Database monitoring is enabled
- [ ] Performance monitoring is enabled

### Database
- [ ] MongoDB is backed up daily
- [ ] Backup retention policy is set (30+ days)
- [ ] Indexes are created on frequently queried fields
- [ ] Connection pooling is configured

---

## Running Application Locally Before Deployment

### Start Backend
```bash
cd backend
npm start  # Runs on http://localhost:5000
```

### Start Frontend
```bash
cd Frontend
npm run dev  # Runs on http://localhost:3000
```

### Test Health Endpoint
```bash
curl http://localhost:5000/api/health
```

### Test Authentication
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123","name":"Test User","phone":"1234567890"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123"}'
```

---

## Monitoring & Maintenance

### View Logs (Vercel)
```bash
vercel logs your-backend-app.vercel.app
```

### View Logs (Heroku)
```bash
heroku logs --tail --app your-app-name
```

### Monitor Database
- MongoDB Atlas Dashboard: https://cloud.mongodb.com
- Check connection count
- Monitor query performance
- Review backup status

### Update Application
```bash
# Pull latest changes
git pull origin main

# Reinstall dependencies if needed
npm install

# Rebuild and redeploy
# (Specific to your hosting platform)
```

---

## Troubleshooting

### 502 Bad Gateway
- Check if backend server is running
- Verify MongoDB connection string is correct
- Check error logs for authentication failures

### CORS Errors
- Verify ALLOWED_ORIGINS environment variable matches frontend domain
- Check browser console for exact error message
- Ensure `credentials: true` is set if needed

### Translation Fails
- Verify OPENAI_API_KEY and GEMINI_API_KEY are set correctly
- Check API key quotas and limits
- Review API service status pages

### Slow Performance
- Check database query performance
- Monitor API rate limiting
- Check server resource usage (CPU, memory)
- Review CDN configuration

---

## Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Heroku Docs**: https://devcenter.heroku.com
- **Railway Docs**: https://docs.railway.app
- **MongoDB Docs**: https://docs.mongodb.com
- **Express.js Security**: https://expressjs.com/en/advanced/best-practice-security.html

---

## Cost Estimates (Monthly)

| Platform | Cost | Pros | Cons |
|----------|------|------|------|
| Vercel | Free-$20 | Easy, fast, integrated CI/CD | Limited database support |
| Heroku | $0-50 | Simple, auto-scaling | Expensive after free tier |
| Railway | $5-30 | Good pricing, easy setup | Smaller community |
| AWS | $0-50 | Powerful, free tier | Complex setup, steep learning curve |
| DigitalOcean | $5-40 | Affordable, simple | Manual configuration |

---

**Last Updated**: 2024-06-24  
**Status**: Production Ready ✅
