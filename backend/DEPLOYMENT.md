# Backend Deployment Guide

## Option 1: Vercel (Recommended - Free)

### Steps:
1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy from the backend folder:
   ```bash
   cd backend
   vercel
   ```

3. Follow the prompts:
   - Create new project
   - Link to your account
   - Deploy

4. Add environment variables in Vercel dashboard:
   - Go to your project settings
   - Navigate to Environment Variables
   - Add these variables:
     ```
     OPENAI_API_KEY=your_openai_key
     BRAVE_API_KEY=your_brave_key
     SUPABASE_URL=your_supabase_url
     SUPABASE_ANON_KEY=your_supabase_anon_key
     TWILIO_ACCOUNT_SID=your_twilio_sid
     TWILIO_AUTH_TOKEN=your_twilio_token
     TWILIO_PHONE_NUMBER=your_twilio_phone
     ```

5. Your backend will be available at:
   ```
   https://your-project-name.vercel.app
   ```

## Option 2: Railway (Auto-deploy from GitHub)

1. Push your code to GitHub
2. Go to [railway.app](https://railway.app)
3. Click "New Project" → "Deploy from GitHub"
4. Select your repository
5. Add environment variables in Railway dashboard
6. Railway will auto-deploy on every push

## Option 3: Render (Free tier)

1. Create account at [render.com](https://render.com)
2. New → Web Service
3. Connect GitHub repository
4. Build command: `npm install`
5. Start command: `node server.js`
6. Add environment variables in dashboard

## Option 4: Fly.io

1. Install flyctl:
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. Deploy:
   ```bash
   fly launch
   fly deploy
   ```

## Update iOS App

After deployment, update your iOS app configuration:

1. Open `HannahHealth/Core/Configuration/EnvironmentLoader.swift`
2. Update the API URL:
   ```swift
   static let apiURL = "https://your-backend-url.vercel.app"
   ```

3. Rebuild the iOS app

## Testing

Test your deployed backend:
```bash
curl https://your-backend-url.vercel.app/api/health
```

Should return:
```json
{"status":"OK","message":"Hannah API is running"}
```