# 🚀 GitHub Pages Deployment Guide - MTG Collection Tracker

This guide will help you deploy your MTG Collection Tracker to GitHub Pages for free hosting.

## 📋 Prerequisites

- GitHub account
- Git installed on your computer
- Your MTG Collection Tracker project files

## 🎯 Quick Deployment (Current Setup)

Your app is already deployed! Visit: **https://durantoss.github.io/mtg-collection-tracker/**

## 🔧 How GitHub Pages Deployment Works

### Current Configuration
- **Repository**: https://github.com/Durantoss/mtg-collection-tracker
- **Branch**: `main` (or `master`)
- **Source**: Root directory (`/`)
- **Custom Domain**: Not configured (using default GitHub Pages URL)

### Automatic Deployment
Every time you push changes to your main branch, GitHub Pages automatically:
1. Detects the changes
2. Builds and deploys your site
3. Makes it available at your GitHub Pages URL
4. Usually takes 1-5 minutes to update

## 🛠️ Manual Setup Instructions

If you need to set up GitHub Pages from scratch:

### Step 1: Repository Setup
1. **Create GitHub Repository**
   ```bash
   # If not already done
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/mtg-collection-tracker.git
   git push -u origin main
   ```

### Step 2: Enable GitHub Pages
1. Go to your repository on GitHub
2. Click **Settings** tab
3. Scroll down to **Pages** section
4. Under **Source**, select:
   - **Deploy from a branch**
   - **Branch**: `main`
   - **Folder**: `/ (root)`
5. Click **Save**

### Step 3: Wait for Deployment
- GitHub will show a green checkmark when ready
- Your site will be available at: `https://YOUR_USERNAME.github.io/REPOSITORY_NAME/`

## 📱 PWA Considerations for GitHub Pages

### HTTPS Requirement
✅ **Automatic**: GitHub Pages provides HTTPS by default
- Your PWA will work correctly
- Service workers will function properly
- Install prompts will appear

### Relative Paths
✅ **Already Configured**: Your app uses relative paths
- All assets load correctly
- Service worker caches work properly
- Manifest.json references are correct

### Custom Domain (Optional)
If you want a custom domain like `mtgtracker.com`:

1. **Add CNAME file** to your repository root:
   ```
   mtgtracker.com
   ```

2. **Configure DNS** with your domain provider:
   ```
   Type: CNAME
   Name: www (or @)
   Value: YOUR_USERNAME.github.io
   ```

3. **Update GitHub Pages settings**:
   - Go to Settings → Pages
   - Enter your custom domain
   - Enable "Enforce HTTPS"

## 🔄 Updating Your Deployment

### Method 1: Git Commands
```bash
# Make your changes
git add .
git commit -m "Update description"
git push origin main
```

### Method 2: GitHub Web Interface
1. Edit files directly on GitHub
2. Commit changes
3. Automatic deployment triggers

### Method 3: GitHub Desktop
1. Make changes locally
2. Commit in GitHub Desktop
3. Push to origin

## 🚨 Troubleshooting

### Site Not Loading
- **Check Repository Settings**: Ensure Pages is enabled
- **Verify Branch**: Make sure you're deploying from the correct branch
- **Wait Time**: Allow 5-10 minutes for changes to propagate
- **Clear Cache**: Hard refresh your browser (Ctrl+F5)

### PWA Not Installing
- **HTTPS Check**: Ensure you're accessing via HTTPS
- **Manifest Validation**: Check browser console for manifest errors
- **Service Worker**: Verify sw.js is loading without errors
- **Browser Support**: Test in Chrome/Edge for best PWA support

### Assets Not Loading
- **Relative Paths**: Ensure all paths start with `/` or are relative
- **Case Sensitivity**: GitHub Pages is case-sensitive
- **File Names**: Check for typos in file references

### 404 Errors
- **Index File**: Ensure `index.html` exists in root
- **File Extensions**: Include `.html` in URLs if needed
- **Routing**: GitHub Pages doesn't support client-side routing by default

## 📊 Monitoring Your Deployment

### GitHub Actions
- Check the **Actions** tab in your repository
- View deployment logs and status
- See build times and any errors

### GitHub Pages Status
- Visit your repository Settings → Pages
- See last deployment time and status
- View any deployment errors

### Analytics (Optional)
Add Google Analytics or similar to track usage:
```html
<!-- Add to index.html <head> -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## 🎯 Performance Optimization

### Caching Headers
GitHub Pages automatically sets appropriate cache headers for:
- Static assets (CSS, JS, images)
- HTML files
- Service worker files

### CDN Benefits
✅ **Global Distribution**: GitHub Pages uses a global CDN
✅ **Fast Loading**: Content served from nearest location
✅ **High Availability**: 99.9% uptime SLA

### Image Optimization
Consider optimizing images before deployment:
```bash
# Using imagemin (optional)
npm install -g imagemin-cli imagemin-pngquant imagemin-mozjpeg
imagemin icons/*.png --out-dir=icons/ --plugin=pngquant
```

## 🔒 Security Features

### Automatic HTTPS
- All GitHub Pages sites use HTTPS
- HTTP requests automatically redirect to HTTPS
- Perfect for PWA requirements

### Content Security
- GitHub scans for malicious content
- Automatic security updates for dependencies
- DDoS protection included

## 📈 Scaling Considerations

### GitHub Pages Limits
- **Bandwidth**: 100GB per month
- **Storage**: 1GB repository size
- **Build Time**: 10 minutes max
- **Files**: No server-side processing

### When to Consider Alternatives
If you need:
- Server-side processing
- Database operations
- More than 100GB bandwidth
- Custom server configuration

Consider: Netlify, Vercel, or Firebase Hosting

## 🎉 Success Checklist

- ✅ Repository created and configured
- ✅ GitHub Pages enabled
- ✅ Site accessible via HTTPS
- ✅ PWA features working (install prompt, offline mode)
- ✅ All assets loading correctly
- ✅ Service worker registered successfully
- ✅ Manifest.json valid
- ✅ Mobile installation tested

## 🆘 Getting Help

### GitHub Support
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [GitHub Community Forum](https://github.community/)

### PWA Resources
- [PWA Builder](https://www.pwabuilder.com/)
- [Web.dev PWA Guide](https://web.dev/progressive-web-apps/)

### MTG API Resources
- [Scryfall API Documentation](https://scryfall.com/docs/api)

---

## 🎊 Congratulations!

Your MTG Collection Tracker is now live on GitHub Pages! 

**Live URL**: https://durantoss.github.io/mtg-collection-tracker/

Enjoy your free, fast, and reliable hosting! 🃏✨
