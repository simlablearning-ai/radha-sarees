# GitHub Push Guide - Radha Sarees

## 🔒 Security Checklist (COMPLETE BEFORE PUSHING)

### ✅ Files Already Protected
The following are already in `.gitignore` and won't be pushed:
- ✅ All `.env` files
- ✅ `node_modules/` directory  
- ✅ Documentation `.md` files (except README.md)
- ✅ Build artifacts (`dist/`, `build/`)
- ✅ `Admin.tsx` (contains standalone admin code)
- ✅ `fix-imports.js`
- ✅ `VERCEL_SETUP.txt`

### ⚠️ Files That WILL Be Pushed (Safe to commit)
- ✅ `/utils/supabase/info.tsx` - Contains only PUBLIC anon key (safe)
- ✅ All component files in `/components/`
- ✅ All library files in `/lib/`
- ✅ Supabase Edge Functions in `/supabase/functions/server/`
- ✅ `README.md`
- ✅ Configuration files (`package.json`, `tsconfig.json`, etc.)

### 🚫 What's EXCLUDED (Won't be pushed)
These sensitive files are excluded via `.gitignore`:
- 🚫 All environment variables (`.env*`)
- 🚫 Project documentation files (except README.md)
- 🚫 Build outputs
- 🚫 Cache directories
- 🚫 Editor settings
- 🚫 Temporary files

## 📝 Pre-Push Instructions

### Step 1: Initialize Git (if not already done)
```bash
git init
git add .
git commit -m "Initial commit: Radha Sarees E-commerce Platform"
```

### Step 2: Create GitHub Repository
1. Go to https://github.com/new
2. Create a new **PRIVATE** repository named `radha-sarees`
3. Do NOT initialize with README, .gitignore, or license (already have them)

### Step 3: Connect and Push
```bash
# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/radha-sarees.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## 🔐 Environment Variables for Deployment

### For Vercel Deployment:
After pushing to GitHub and connecting to Vercel, add these environment variables in Vercel Dashboard:

```bash
VITE_SUPABASE_URL=https://idlwcefmmisueqvzwlrf.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkbHdjZWZtbWlzdWVxdnp3bHJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcyNjI1NDIsImV4cCI6MjA4MjgzODU0Mn0.UdgzsRvdcBElH8MZUxkWMMy4WgzLLaAtxnJBCCmjd4k
```

**Note:** These values are already in your Supabase project and can be found at:
https://supabase.com/dashboard/project/idlwcefmmisueqvzwlrf/settings/api

### For Netlify Deployment:
Same environment variables as Vercel above, but add them in Netlify Dashboard.

## 🎯 What's Being Pushed

### Essential Files (Safe to Push):
```
✅ /components/             # All React components
✅ /lib/                    # State management & API client
✅ /styles/globals.css      # Design system CSS
✅ /supabase/functions/     # Backend server code
✅ /App.tsx                 # Main application
✅ /index.html             # HTML entry
✅ /package.json           # Dependencies
✅ /tsconfig.json          # TypeScript config
✅ /vite.config.ts         # Vite config
✅ /README.md              # Documentation
✅ /.gitignore             # Git exclusions
✅ /netlify.toml           # Netlify config
✅ /vercel.json            # Vercel config
```

### Files EXCLUDED (Won't be pushed):
```
🚫 /*.md                    # All documentation except README
🚫 /Admin.tsx               # Standalone admin file
🚫 /fix-imports.js         # Build script
🚫 /VERCEL_SETUP.txt       # Setup notes
🚫 /.env*                  # Environment variables
🚫 /node_modules/          # Dependencies
🚫 /dist/                  # Build output
🚫 /.vercel/               # Vercel cache
🚫 /.netlify/              # Netlify cache
```

## 🚀 Post-Push Deployment Steps

### Option 1: Deploy to Vercel
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Framework Preset: **Vite**
4. Add environment variables (see above)
5. Click **Deploy**

### Option 2: Deploy to Netlify
1. Go to https://app.netlify.com/start
2. Import your GitHub repository
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Add environment variables (see above)
6. Click **Deploy site**

## 🔄 Future Updates

After making changes to your code:

```bash
# Stage all changes
git add .

# Commit with descriptive message
git commit -m "Your commit message here"

# Push to GitHub
git push origin main
```

Vercel/Netlify will automatically redeploy when you push to main branch.

## ⚠️ Security Notes

1. **Public Anon Key**: The Supabase anon key in `/utils/supabase/info.tsx` is designed to be public and included in frontend code. This is normal and safe.

2. **Service Role Key**: The service role key is stored in Supabase Edge Functions environment and is NOT in the codebase. ✅

3. **Admin Credentials**: Change default admin password (`admin123`) in production!

4. **Repository Privacy**: Consider making the repository PRIVATE on GitHub for proprietary code.

## 📞 Support

If you encounter any issues during deployment, check:
- Vercel/Netlify build logs
- Environment variables are correctly set
- All dependencies are listed in package.json

## ✨ You're Ready!

Your codebase is now secure and ready to push to GitHub. The `.gitignore` file will ensure sensitive information stays private.
