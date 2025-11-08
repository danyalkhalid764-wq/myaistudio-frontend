# Netlify Setup Guide for MyAIStudio Frontend

## ✅ Code Pushed to GitHub

Your frontend code is now at: https://github.com/danyalkhalid764-wq/myaistudio-frontend

## 🚀 Connect to Netlify

### Step 1: Create New Site in Netlify

1. Go to [Netlify Dashboard](https://app.netlify.com/)
2. Click **"Add new site"** → **"Import an existing project"**
3. Select **"Deploy with GitHub"**
4. Authorize Netlify to access your GitHub account (if needed)
5. Select repository: **`myaistudio-frontend`**
6. Click **"Configure"**

### Step 2: Configure Build Settings

Netlify will auto-detect from `netlify.toml`, but verify:

- **Base directory**: (leave empty - root is fine)
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Node version**: 18 (auto-set from netlify.toml)

Click **"Deploy site"**

### Step 3: Set Environment Variable

**IMPORTANT**: Set this BEFORE the first build completes, or trigger a new build after setting it.

1. Go to **Site settings** (gear icon)
2. Click **Environment variables** (left sidebar)
3. Click **Add a variable**
4. Enter:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://pakistani-project-backend-production.up.railway.app`
   - **Scopes**: Select "All scopes" or "Production"
5. Click **Save**

### Step 4: Trigger New Build (If Already Built)

If the site already built before you set the environment variable:

1. Go to **Deploys** tab
2. Click **Trigger deploy** → **Deploy site**
3. Wait for build to complete

## ✅ Verify It's Working

1. **Open your Netlify site** (Netlify will provide the URL)
2. **Open browser console** (F12)
3. **Try to login/register**
4. **Check console** - You should see:
   ```
   🔗 API Base URL: https://pakistani-project-backend-production.up.railway.app ✅
   🔗 VITE_API_URL env var: https://pakistani-project-backend-production.up.railway.app ✅
   ```

## 🔗 Your URLs

- **Frontend (Netlify)**: Your Netlify site URL (e.g., `https://your-site.netlify.app`)
- **Backend (Railway)**: `https://pakistani-project-backend-production.up.railway.app`

## 📋 Quick Checklist

- [ ] Connected GitHub repo to Netlify
- [ ] Build settings configured (auto-detected from netlify.toml)
- [ ] Set `VITE_API_URL` environment variable
- [ ] Value: `https://pakistani-project-backend-production.up.railway.app`
- [ ] Triggered new build (if needed)
- [ ] Tested login/register
- [ ] Console shows correct API URL (not localhost:8000)

## 🎉 Done!

Your frontend is now deployed on Netlify and connected to your Railway backend!

