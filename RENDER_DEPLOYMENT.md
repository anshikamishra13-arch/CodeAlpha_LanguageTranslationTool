# 🚀 Deploy on Render.com - Complete Guide

> **Recommended Platform**: Render is ideal for full-stack applications with free tier support

---

## ⚠️ **What Was Fixed**

✅ **Removed backend dependencies from Frontend** - Frontend had server packages that broke builds  
✅ **Created render.yaml** - Configures both backend and frontend services  
✅ **Monorepo setup** - Both services deploy together seamlessly  

---

## Step 1: Prepare Your Repository

### Push code to GitHub
```bash
git add .
git commit -m "Fix frontend dependencies and add Render config"
git push origin main
```

---

## Step 2: Create MongoDB Atlas Account (Free)

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for free account
3. Create a **M0 free cluster**
4. Click **Connect** → **Drivers** → Copy the connection string
5. Replace `<username>` and `<password>` with your credentials
6. Example: `mongodb+srv://myuser:mypass123@cluster0.abc123.mongodb.net/linguaai`
7. **Save this** - you'll need it in Step 4

---

## Step 3: Get API Keys

### OpenAI API Key (Required)
1. Go to https://platform.openai.com/api-keys
2. Click **Create new secret key**
3. Copy it (starts with `sk-proj-`) - **save it safely!**

### Google Gemini API Key (Optional)
1. Go to https://ai.google.dev
2. Click **Get API key**
3. Copy and save

---

## Step 4: Deploy on Render

### Backend Service

1. **Go to https://render.com** and sign up
2. Click **+ New** → **Web Service**
3. Connect your GitHub repository
4. Fill in these fields:

| Field | Value |
|-------|-------|
| **Name** | `linguaai-backend` |
| **Runtime** | `Node` |
| **Root Directory** | `backend` |
| **Build Command** | `npm install` |
| **Start Command** | `npm run prod` |
| **Instance Type** | `Free` |

5. Click **Advanced** and add Environment Variables:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `5000` |
| `MONGO_URI` | Your MongoDB connection string from Step 2 |
| `OPENAI_API_KEY` | Your OpenAI key from Step 3 |
| `GEMINI_API_KEY` | Your Gemini key (optional) |
| `JWT_SECRET` | `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2` |
| `ALLOWED_ORIGINS` | `https://linguaai-frontend.onrender.com` |

6. Click **Create Web Service**
7. **Wait 3-5 minutes** for deployment
8. You'll get a URL: `https://linguaai-backend.onrender.com`
9. **Copy this URL** - needed for frontend

### Frontend Service

1. Click **+ New** → **Web Service** (again)
2. Connect your GitHub repository
3. Fill in these fields:

| Field | Value |
|-------|-------|
| **Name** | `linguaai-frontend` |
| **Runtime** | `Node` |
| **Root Directory** | `Frontend` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm run preview` |
| **Instance Type** | `Free` |

4. Click **Advanced** and add Environment Variables:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://linguaai-backend.onrender.com` (from Step 4 backend) |

5. Click **Create Web Service**
6. **Wait 5-10 minutes** for build and deployment
7. You'll get a URL: `https://linguaai-frontend.onrender.com`

---

## Step 5: Update Backend CORS

After frontend deploys, update backend ALLOWED_ORIGINS:

1. Go to Render dashboard
2. Select `linguaai-backend` service
3. Go to **Environment** tab
4. Update `ALLOWED_ORIGINS`:
   - Remove: `https://linguaai-frontend.onrender.com`  (old value)
   - Add: Your actual frontend URL from Step 4

5. The service will auto-redeploy in ~1 minute

---

## ✅ Verify Deployment

### Test Backend
```bash
curl https://linguaai-backend.onrender.com/api/health
# Response: {"status":"ok","timestamp":"2024-06-24T..."}
```

### Test Frontend
Open `https://linguaai-frontend.onrender.com` in browser - should see login page

### Test Login
1. Sign up with email and password
2. Should succeed and redirect to translate page

### Test Translation
1. Login
2. Select source/target language
3. Enter text
4. Should translate successfully

---

## 🐛 **Troubleshooting**

### Frontend shows blank page or 404
- Check browser console for errors (F12 → Console)
- Verify `VITE_API_URL` is set correctly
- Verify backend is running: check backend service logs

### Backend deployment failed
- Check logs: Service → Logs tab
- Common issues:
  - `MONGO_URI` is invalid or empty
  - `OPENAI_API_KEY` is missing
  - `NODE_ENV` is not `production`

### Can't connect frontend to backend
- Verify backend `ALLOWED_ORIGINS` includes frontend URL
- Check network tab (F12 → Network) for failed requests
- Test manually: `curl https://linguaai-backend.onrender.com/api/health`

### Service keeps crashing
- Check logs for errors
- If "out of memory" - restart the service (free tier has limited RAM)
- May need to upgrade to paid plan for production use

---

## 📊 Render Free Tier Limits

| Feature | Limit |
|---------|-------|
| **Instances** | 2 free web services |
| **Memory** | 512 MB per service |
| **CPU** | Shared |
| **Storage** | Ephemeral (resets on deploy) |
| **Data Transfer** | 100 GB/month |
| **Auto-sleep** | Yes (spins down after 15 min inactivity) |

> **Note**: Free tier may have cold starts (5-10 sec delay after inactivity)

---

## 💰 Upgrade to Production

When ready for production, upgrade to paid:

1. Select service
2. Click **Instance Type** → Choose paid plan
3. Benefits: Always-on, faster performance, more memory
4. **Pricing**: ~$7/month per service

---

## 🔒 Additional Security Recommendations

1. **Change JWT_SECRET** - Use a strong random string
2. **Whitelist origins carefully** - Only allow your frontend domain
3. **Use MongoDB password auth** - Don't use weak passwords
4. **Enable HTTPS** - Render handles this automatically
5. **Monitor logs** - Check for suspicious activity
6. **Set up alerts** - Enable email notifications for failures

---

## 📞 Need Help?

- **Render Docs**: https://render.com/docs
- **GitHub Issues**: Create an issue in your repo
- **Local Testing**: Run `npm run dev` in backend and `npm run dev` in Frontend to test locally first
