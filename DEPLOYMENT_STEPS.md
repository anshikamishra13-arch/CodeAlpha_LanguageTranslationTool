# 🚀 Complete Step-by-Step Deployment Guide

## Choose Your Platform

Pick ONE option based on your preference:

| Platform | Difficulty | Cost | Time | Best For |
|----------|-----------|------|------|----------|
| **Vercel** | ⭐ Easiest | Free | 5 min | Quick deployment |
| **Heroku** | ⭐⭐ Easy | $7/mo | 10 min | Simple hosting |
| **Railway** | ⭐⭐ Easy | $5/mo | 10 min | Good value |
| **AWS** | ⭐⭐⭐ Hard | $0-50/mo | 30 min | Full control |

**Recommended for beginners: Vercel** ✅

---

## OPTION 1: Deploy on Vercel (EASIEST - 5 MINUTES)

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Get MongoDB Connection String
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up (free account)
3. Create a cluster (M0 free tier)
4. Click **Connect** → **Drivers** → **Node.js**
5. Copy the connection string
   - Replace `<username>` and `<password>` with your credentials
   - Example: `mongodb+srv://myuser:mypass123@cluster0.abc123.mongodb.net/linguaai`

### Step 3: Get API Keys

#### OpenAI Key:
1. Go to https://platform.openai.com/api-keys
2. Sign up or login
3. Click **Create new secret key**
4. Copy it (starts with `sk-proj-`)
5. **SAVE IT SAFELY** - you won't see it again!

#### Gemini Key (Optional):
1. Go to https://ai.google.dev
2. Click **Get API key**
3. Copy it (optional, for fallback)

### Step 4: Create Vercel Environment File

**Create `backend/.env.production`:**
```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.abc123.mongodb.net/linguaai
OPENAI_API_KEY=sk-proj-your-actual-key-here
GEMINI_API_KEY=your-gemini-key-optional
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
ALLOWED_ORIGINS=https://your-frontend-url.vercel.app
```

**Create `Frontend/.env.production`:**
```env
VITE_API_URL=https://your-backend-url.vercel.app
```

### Step 5: Deploy Backend
```bash
cd backend
vercel --env-file .env.production
```

**Follow the prompts:**
- ? Set up and deploy "backend"? → **yes**
- ? Which scope? → Select your account
- ? Link to existing project? → **no** (first time)
- ? What's your project's name? → `linguaai-backend`
- ? In which directory is your code? → `.` (current)
- ? Want to modify these settings? → **no**

**You'll get a URL like:** `https://linguaai-backend.vercel.app`
- Copy this URL - you'll need it for frontend

### Step 6: Update Frontend Environment
```bash
cd ../Frontend
# Edit .env.production
# Replace VITE_API_URL with your backend URL from Step 5
VITE_API_URL=https://linguaai-backend.vercel.app
```

### Step 7: Deploy Frontend
```bash
vercel --env-file .env.production
```

**Follow the prompts:**
- ? Set up and deploy "Frontend"? → **yes**
- ? Which scope? → Select your account
- ? Link to existing project? → **no**
- ? What's your project's name? → `linguaai-frontend`
- ? In which directory is your code? → `.` (current)
- ? Want to modify these settings? → **no**

**You'll get a URL like:** `https://linguaai-frontend.vercel.app`

### Step 8: Test Your Deployment
1. Open: `https://linguaai-frontend.vercel.app`
2. Create an account
3. Test translation
4. Check history

### Done! 🎉
Your app is now live on Vercel!

---

## OPTION 2: Deploy on Heroku (10 MINUTES)

### Step 1: Install Heroku CLI
Download from: https://devcenter.heroku.com/articles/heroku-cli

### Step 2: Login to Heroku
```bash
heroku login
```

### Step 3: Create Backend App
```bash
cd backend
heroku create linguaai-backend
```

### Step 4: Get MongoDB String (from Step 1.2 above)

### Step 5: Get API Keys (from Step 1.3 above)

### Step 6: Set Environment Variables
```bash
heroku config:set MONGO_URI="mongodb+srv://user:password@cluster.mongodb.net/linguaai" --app linguaai-backend
heroku config:set OPENAI_API_KEY="sk-proj-your-key" --app linguaai-backend
heroku config:set JWT_SECRET="a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2" --app linguaai-backend
heroku config:set NODE_ENV="production" --app linguaai-backend
heroku config:set ALLOWED_ORIGINS="https://linguaai-frontend.herokuapp.com" --app linguaai-backend
```

### Step 7: Deploy Backend
```bash
git push heroku main
```

**Wait for deployment to complete...**

### Step 8: View Backend Logs
```bash
heroku logs --tail --app linguaai-backend
```

### Step 9: Create Frontend App
```bash
cd ../Frontend
heroku create linguaai-frontend
```

### Step 10: Set Frontend Environment
```bash
# Get your backend URL first
heroku apps:info linguaai-backend

heroku config:set VITE_API_URL="https://linguaai-backend.herokuapp.com" --app linguaai-frontend
```

### Step 11: Deploy Frontend
```bash
git subtree push --prefix Frontend heroku main
```

### Step 12: Test Your Deployment
```bash
heroku open --app linguaai-frontend
```

### Done! 🎉
Your app is now live on Heroku!

**Note**: Heroku costs ~$7/month after free tier

---

## OPTION 3: Deploy on Railway (10 MINUTES)

### Step 1: Install Railway CLI
```bash
npm install -g @railway/cli
```

### Step 2: Login to Railway
```bash
railway login
```

### Step 3: Create Project
```bash
railway init
```

### Step 4: Add PostgreSQL/MongoDB
```bash
railway add --plugin postgresql
```

### Step 5: Set Environment Variables
In Railway dashboard:
1. Go to Variables tab
2. Add each variable:
   - `MONGO_URI`
   - `OPENAI_API_KEY`
   - `JWT_SECRET`
   - `NODE_ENV=production`

### Step 6: Deploy
```bash
railway up
```

### Done! 🎉

---

## OPTION 4: Deploy on AWS (30 MINUTES - Advanced)

### Step 1: Create EC2 Instance
1. Go to https://aws.amazon.com
2. Sign up for free tier
3. Launch EC2 instance (Ubuntu 20.04 LTS)
4. Create security group allowing ports 80, 443, 5000
5. Get your instance IP

### Step 2: SSH into Instance
```bash
ssh -i your-key.pem ubuntu@your-instance-ip
```

### Step 3: Install Node.js
```bash
curl -sL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Step 4: Install PM2 (Process Manager)
```bash
sudo npm install -g pm2
```

### Step 5: Clone Repository
```bash
git clone https://github.com/YOUR_USERNAME/CodeAlpha_LanguageTranslationTool.git
cd CodeAlpha_LanguageTranslationTool/backend
npm install
```

### Step 6: Create .env.production
```bash
nano .env.production
```

Add:
```env
NODE_ENV=production
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/linguaai
OPENAI_API_KEY=sk-proj-your-key
JWT_SECRET=your-secret
ALLOWED_ORIGINS=https://your-domain.com
```

### Step 7: Start Backend with PM2
```bash
pm2 start npm --name "linguaai" -- start
pm2 startup
pm2 save
```

### Step 8: Setup Nginx Reverse Proxy
```bash
sudo apt-get install nginx
sudo nano /etc/nginx/sites-available/default
```

Add:
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
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

### Step 9: Enable SSL with Let's Encrypt
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### Step 10: Deploy Frontend to S3
```bash
cd ../Frontend
npm run build

# Upload dist/ folder to S3 bucket
aws s3 sync dist/ s3://your-bucket-name
```

### Done! 🎉

---

## 🧪 Test Your Deployment

### Test Health Endpoint
```bash
curl https://your-backend-url/api/health
```

**Expected response:**
```json
{"status":"ok","timestamp":"2024-06-24T..."}
```

### Test Registration
```bash
curl -X POST https://your-backend-url/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123",
    "name": "Test User",
    "phone": "1234567890"
  }'
```

### Test Login
```bash
curl -X POST https://your-backend-url/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123"}'
```

### Test Translation
Replace `TOKEN` with JWT from login response:
```bash
curl -X POST https://your-backend-url/api/translate \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "inputText": "Hello world",
    "targetLang": "Spanish"
  }'
```

---

## 🐛 Troubleshooting

### MongoDB Connection Error
```
Error: querySrv ECONNREFUSED
```
**Solution:**
- Check MONGO_URI is correct
- Whitelist your IP in MongoDB Atlas (0.0.0.0/0 for testing)
- Verify username and password

### API Key Invalid
```
Error: Invalid API key
```
**Solution:**
- Regenerate OpenAI key at https://platform.openai.com/api-keys
- Check key has credit ($5+)
- Ensure key is copied completely

### CORS Error
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution:**
- Check ALLOWED_ORIGINS matches your frontend URL
- Clear browser cache
- Verify frontend URL in environment variable

### Rate Limited
```
429 Too many requests
```
**Solution:**
- Wait 15 minutes for rate limit to reset
- Limits: Auth (5/15min), API (100/15min), Translation (20/min)

---

## 📊 Deployment Comparison

| Feature | Vercel | Heroku | Railway | AWS |
|---------|--------|--------|---------|-----|
| **Ease** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |
| **Speed** | 5 min | 10 min | 10 min | 30 min |
| **Cost** | Free | $7/mo | $5/mo | $0-50/mo |
| **Scalability** | ✅ Great | ✅ Good | ✅ Good | ✅⭐⭐⭐ |
| **Control** | Limited | Limited | Medium | Full |
| **Setup** | CLI | CLI | CLI | Manual |

---

## ✅ Post-Deployment Checklist

- [ ] Backend API responds to `/api/health`
- [ ] Frontend loads without errors
- [ ] Can create account (register)
- [ ] Can login with credentials
- [ ] Can translate text
- [ ] Translation history loads
- [ ] Rate limiting is active
- [ ] Errors display safely
- [ ] Environment variables set
- [ ] HTTPS working (green lock)
- [ ] CORS working (no errors)
- [ ] Database connection stable
- [ ] API keys working
- [ ] Monitoring enabled

---

## 🎯 Quick Reference

### Vercel Quick Deploy
```bash
# Backend
cd backend
vercel --env-file .env.production

# Frontend
cd ../Frontend
vercel --env-file .env.production
```

### Heroku Quick Deploy
```bash
# Set variables first
heroku config:set VAR_NAME=value --app your-app

# Deploy
git push heroku main
```

### Railway Quick Deploy
```bash
railway init
railway add
railway up
```

---

## 📞 Need Help?

- **Vercel Docs**: https://vercel.com/docs
- **Heroku Docs**: https://devcenter.heroku.com
- **Railway Docs**: https://docs.railway.app
- **AWS Docs**: https://docs.aws.amazon.com
- **MongoDB**: https://docs.mongodb.com
- **OpenAI**: https://platform.openai.com/docs

---

**Choose Vercel for the fastest, easiest deployment!** ✅

Last Updated: 2024-06-24
