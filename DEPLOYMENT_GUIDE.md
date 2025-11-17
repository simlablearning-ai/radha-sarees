# Deployment Guide: Radha Sarees to Vercel

This guide will walk you through deploying your Radha Sarees application to Vercel.

## 📋 Prerequisites

Before you begin, make sure you have:

1. ✅ A GitHub account (https://github.com)
2. ✅ A Vercel account (https://vercel.com - free tier is fine)
3. ✅ Your Supabase project is running (it already is!)
4. ✅ Git installed on your computer (optional, can use GitHub web interface)

## 🎯 Architecture Overview

Your application will be deployed as follows:

```
Vercel (Frontend)  →  Supabase Edge Functions (Backend)  →  Supabase Database
     ↓
Your Custom Domain (optional)
```

- **Vercel**: Hosts your React frontend (free SSL, global CDN)
- **Supabase**: Hosts your backend and database (already set up)

## 📦 Step 1: Export Your Code

### Option A: Download from Figma Make

1. Click on the **"Export"** or **"Download"** button in Figma Make
2. Save the ZIP file to your computer
3. Extract the ZIP file to a folder (e.g., `radha-sarees`)

### Option B: Already Have the Code?

If you already have the code on your computer, skip to Step 2.

## 🐙 Step 2: Push Code to GitHub

### Option A: Using GitHub Desktop (Easiest)

1. **Download GitHub Desktop**: https://desktop.github.com
2. **Install and sign in** with your GitHub account
3. Click **"File"** → **"Add Local Repository"**
4. Select your `radha-sarees` folder
5. Click **"Publish repository"**
6. Name it `radha-sarees`
7. Click **"Publish repository"**

### Option B: Using Git Command Line

```bash
# Navigate to your project folder
cd radha-sarees

# Initialize git repository
git init

# Add all files
git add .

# Commit files
git commit -m "Initial commit: Radha Sarees e-commerce platform"

# Create repository on GitHub (do this first on github.com)
# Then connect and push
git remote add origin https://github.com/YOUR_USERNAME/radha-sarees.git
git branch -M main
git push -u origin main
```

### Option C: Using GitHub Web Interface

1. Go to https://github.com/new
2. Name your repository `radha-sarees`
3. Click **"Create repository"**
4. Click **"uploading an existing file"**
5. Drag and drop all your project files
6. Click **"Commit changes"**

## 🚀 Step 3: Deploy to Vercel

### 3.1 Connect GitHub to Vercel

1. Go to https://vercel.com
2. Click **"Sign Up"** or **"Log In"**
3. Choose **"Continue with GitHub"**
4. Authorize Vercel to access your GitHub

### 3.2 Import Your Project

1. Click **"Add New..."** → **"Project"**
2. Find your `radha-sarees` repository
3. Click **"Import"**

### 3.3 Configure Project Settings

Vercel will auto-detect your settings. Verify:

- **Framework Preset**: `Vite`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

✅ Click **"Deploy"**

### 3.4 Wait for Deployment

Vercel will:
- ✅ Install dependencies
- ✅ Build your React app
- ✅ Deploy to global CDN
- ✅ Provide you with a URL

This takes **2-5 minutes**.

## 🔑 Step 4: Configure Environment Variables

Your Supabase backend is already running, but you need to tell Vercel where to find it.

### 4.1 Get Your Supabase Credentials

Your credentials are already configured in Figma Make. You need:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

These are in your Supabase project dashboard:
1. Go to https://app.supabase.com
2. Select your project
3. Click **"Settings"** → **"API"**
4. Copy the **"Project URL"** and **"anon public"** key

### 4.2 Add to Vercel

1. In Vercel, go to your project
2. Click **"Settings"** → **"Environment Variables"**
3. Add these variables:

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | Your Supabase Project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key |

4. Click **"Save"**

### 4.3 Redeploy

1. Go to **"Deployments"** tab
2. Click the **"..."** menu on the latest deployment
3. Click **"Redeploy"**

## ✅ Step 5: Test Your Deployment

1. Visit your Vercel URL (e.g., `radha-sarees.vercel.app`)
2. Check if products load
3. Try to sign up / log in
4. Test adding items to cart
5. Access admin panel at: `your-url.vercel.app#admin`

## 🌐 Step 6: Add Custom Domain (Optional)

### 6.1 In Vercel

1. Go to your project settings
2. Click **"Domains"**
3. Click **"Add"**
4. Enter your domain (e.g., `radhasarees.com`)

### 6.2 In Your Domain Provider

Vercel will give you DNS records to add:

**For Root Domain (radhasarees.com)**:
- Type: `A`
- Value: `76.76.21.21`

**For WWW (www.radhasarees.com)**:
- Type: `CNAME`
- Value: `cname.vercel-dns.com`

Wait 24-48 hours for DNS propagation.

## 🔧 Troubleshooting

### Products Not Loading?

**Problem**: Empty product list on homepage

**Solution**: 
1. Go to your admin panel: `your-url.vercel.app#admin`
2. Login with: `admin` / `admin123`
3. Add products manually or use bulk import

### Login Not Working?

**Problem**: Can't log in or sign up

**Solution**:
1. Check browser console (F12) for errors
2. Verify environment variables in Vercel
3. Check Supabase project is active

### Styles Look Wrong?

**Problem**: CSS not loading properly

**Solution**:
1. Clear browser cache (Ctrl+Shift+R)
2. Check if `globals.css` is in `/styles/` folder
3. Redeploy from Vercel

### Environment Variables Not Working?

**Problem**: API calls failing

**Solution**:
1. Make sure variable names start with `VITE_`
2. Redeploy after adding variables
3. Check spelling of variable names

## 📱 Monitoring Your Site

### Vercel Dashboard

- **Analytics**: See visitor stats
- **Logs**: Debug errors in real-time
- **Deployments**: Roll back if needed

### Performance

Vercel provides:
- ✅ Global CDN (fast worldwide)
- ✅ Automatic HTTPS
- ✅ 99.99% uptime
- ✅ Automatic scaling

## 💰 Pricing

### Vercel Free Tier Includes:
- Unlimited personal projects
- 100 GB bandwidth/month
- 100 deployments/day
- Custom domains
- SSL certificates

**This is perfect for your saree store!**

### When to Upgrade?

Only if you exceed:
- 100 GB bandwidth/month (≈ 10,000+ visitors)
- Need team collaboration
- Need advanced analytics

## 🔄 Making Updates

### To Update Your Site:

1. Make changes in Figma Make
2. Download updated code
3. Push to GitHub (same steps as before)
4. Vercel automatically redeploys!

**Or:**

1. Edit code directly on GitHub
2. Vercel detects changes
3. Auto-deploys in 2 minutes

## 🎉 Success Checklist

After deployment, verify:

- [ ] Site loads at your Vercel URL
- [ ] Products display correctly
- [ ] Can create account and login
- [ ] Cart functionality works
- [ ] Checkout process works
- [ ] Admin panel accessible
- [ ] All categories work
- [ ] Search functionality works
- [ ] Mobile responsive design works

## 📞 Need Help?

If you encounter issues:

1. **Check Vercel Logs**: Project → Deployment → View Function Logs
2. **Check Browser Console**: F12 → Console tab
3. **Vercel Support**: https://vercel.com/support
4. **Supabase Support**: https://supabase.com/support

## 🚀 Next Steps

After successful deployment:

1. **Add Products**: Use admin panel to populate your catalog
2. **Test Orders**: Place test orders to verify checkout
3. **Configure Payment**: Set up Razorpay/PhonePe in admin settings
4. **Marketing**: Share your URL with customers!
5. **Monitor**: Watch analytics to understand customer behavior

---

## 🎊 Congratulations!

Your Radha Sarees e-commerce platform is now live on Vercel! 

**Share your URL**: `https://your-project.vercel.app`

Enjoy your professional, scalable e-commerce website! 🛍️✨
