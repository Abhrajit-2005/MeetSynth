# 🚀 Deployment Guide

Complete guide to deploy the AI Meeting Summarizer application to production.

## 📋 Prerequisites

- GitHub account
- Groq API key
- Gmail account with App Password
- Node.js knowledge
- Basic understanding of cloud platforms

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   External      │
│   (Vercel)      │◄──►│   (Railway/     │◄──►│   Services      │
│                 │    │   Render)       │    │                 │
│ • Static Files  │    │ • Node.js API   │    │ • Groq AI       │
│ • CDN           │    │ • SQLite DB     │    │ • Email (SMTP)  │
│ • Auto Deploy   │    │ • Auto Scaling  │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔧 Step 1: Backend Deployment

### Option A: Railway (Recommended)

#### 1.1 Setup Railway Account
1. Visit [Railway](https://railway.app/)
2. Sign up with GitHub
3. Create new project

#### 1.2 Connect Repository
1. Click "Deploy from GitHub repo"
2. Select your repository
3. Choose the `backend` folder
4. Set branch to `main`

#### 1.3 Configure Environment Variables
Add these variables in Railway dashboard:

```env
NODE_ENV=production
PORT=5000
GROQ_API_KEY=your_groq_api_key_here
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
DB_PATH=./database.sqlite
FRONTEND_URL=https://your-frontend-domain.vercel.app
```

#### 1.4 Deploy
1. Railway will automatically detect Node.js
2. Set build command: `npm install`
3. Set start command: `npm start`
4. Deploy will start automatically

#### 1.5 Get Backend URL
- Railway will provide a URL like: `https://your-app.railway.app`
- Note this URL for frontend configuration

### Option B: Render

#### 1.1 Setup Render Account
1. Visit [Render](https://render.com/)
2. Sign up with GitHub
3. Create new Web Service

#### 1.2 Connect Repository
1. Connect your GitHub repository
2. Set root directory to `backend`
3. Choose branch: `main`

#### 1.3 Configure Service
- **Name**: `ai-meeting-summarizer-backend`
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Plan**: Free (or paid for production)

#### 1.4 Environment Variables
Add the same environment variables as Railway.

#### 1.5 Deploy
1. Click "Create Web Service"
2. Render will build and deploy automatically
3. Get your backend URL

## 🌐 Step 2: Frontend Deployment

### Deploy to Vercel

#### 2.1 Install Vercel CLI
```bash
npm install -g vercel
```

#### 2.2 Update API Configuration
Edit `frontend/src/App.tsx`:

```typescript
// Change this line
const API_BASE_URL = 'https://your-backend-domain.railway.app/api';
// or
const API_BASE_URL = 'https://your-backend-domain.onrender.com/api';
```

#### 2.3 Deploy
```bash
cd frontend
vercel
```

#### 2.4 Follow Prompts
- Set up and deploy: `Y`
- Which scope: Select your account
- Link to existing project: `N`
- Project name: `ai-meeting-summarizer-frontend`
- Directory: `./`
- Override settings: `N`

#### 2.5 Get Frontend URL
Vercel will provide a URL like: `https://your-app.vercel.app`

## 🔄 Step 3: Update Backend CORS

### 3.1 Update Backend Environment
In your backend deployment platform (Railway/Render), update:

```env
FRONTEND_URL=https://your-frontend-domain.vercel.app
```

### 3.2 Redeploy Backend
- Railway: Automatic redeploy
- Render: Manual redeploy required

## 🧪 Step 4: Testing Deployment

### 4.1 Test Backend
```bash
curl https://your-backend-domain.railway.app/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "AI Meeting Summarizer API is running"
}
```

### 4.2 Test Frontend
1. Visit your Vercel URL
2. Test file upload
3. Test AI generation
4. Test email sending

### 4.3 Test Email
1. Use the email test endpoint:
```bash
curl -X POST https://your-backend-domain.railway.app/api/email/test \
  -H "Content-Type: application/json" \
  -d '{"testEmail": "your-email@gmail.com"}'
```

## 🔒 Step 5: Security & Production

### 5.1 Environment Variables
Ensure all sensitive data is in environment variables:

```env
# Never commit these to Git
GROQ_API_KEY=sk_...
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### 5.2 CORS Configuration
Backend automatically configures CORS for your frontend domain.

### 5.3 Database Persistence
- Railway: Automatic persistence
- Render: May require external database for production

## 📊 Step 6: Monitoring & Maintenance

### 6.1 Railway Monitoring
- View logs in Railway dashboard
- Monitor resource usage
- Set up alerts

### 6.2 Render Monitoring
- View logs in Render dashboard
- Monitor service health
- Set up notifications

### 6.3 Vercel Analytics
- Enable Vercel Analytics
- Monitor frontend performance
- Track user behavior

## 🚨 Troubleshooting

### Common Deployment Issues

#### Backend Won't Start
1. Check environment variables
2. Verify Node.js version
3. Check build logs
4. Ensure port is available

#### Frontend Can't Connect to Backend
1. Verify backend URL in `App.tsx`
2. Check CORS configuration
3. Test backend health endpoint
4. Verify environment variables

#### Email Not Working
1. Check Gmail App Password
2. Verify SMTP settings
3. Test email configuration endpoint
4. Check email logs

#### Database Issues
1. Verify database path
2. Check file permissions
3. Ensure database is writable
4. Check database logs

### Debug Commands

#### Test Backend Health
```bash
curl https://your-backend-domain.railway.app/health
```

#### Test API Endpoints
```bash
# Test summaries endpoint
curl https://your-backend-domain.railway.app/api/summaries

# Test email endpoint
curl https://your-backend-domain.railway.app/api/email/test \
  -H "Content-Type: application/json" \
  -d '{"testEmail": "test@example.com"}'
```

## 🔄 Continuous Deployment

### Automatic Deployments
- **Railway**: Automatic on Git push
- **Render**: Automatic on Git push
- **Vercel**: Automatic on Git push

### Manual Deployments
```bash
# Backend (Railway/Render)
git push origin main

# Frontend (Vercel)
cd frontend
vercel --prod
```

## 📈 Scaling Considerations

### Free Tier Limits
- **Railway**: $5/month after free tier
- **Render**: Free tier with limitations
- **Vercel**: Generous free tier

### Production Upgrades
1. **Railway**: Upgrade to Pro plan
2. **Render**: Upgrade to paid plan
3. **Vercel**: Upgrade to Pro plan

### Database Scaling
- Consider PostgreSQL for production
- Implement connection pooling
- Add database monitoring

## 🎯 Final Checklist

- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] API endpoints responding correctly
- [ ] Email functionality working
- [ ] CORS properly configured
- [ ] Environment variables set
- [ ] Health checks passing
- [ ] Frontend connecting to backend
- [ ] File upload working
- [ ] AI generation working
- [ ] Email sending working
- [ ] Error handling working
- [ ] Responsive design working

## 🌟 Production URLs

After deployment, you should have:

- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-app.railway.app` or `https://your-app.onrender.com`
- **Health Check**: `https://your-backend-url/health`

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section
2. Review deployment logs
3. Verify environment variables
4. Test endpoints individually
5. Check platform-specific documentation

---

**Happy Deploying! 🚀**
