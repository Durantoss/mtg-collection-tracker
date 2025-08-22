# 🃏 MTG Collection Tracker - Progressive Web App

A comprehensive Magic: The Gathering collection management app that works on all devices, including phones, tablets, and desktops. Now enhanced as a Progressive Web App (PWA) for native app-like experience!

## ✨ Features

### 📱 Collection Management
- **Track Your Cards**: Add, edit, and remove cards from your collection
- **Price Monitoring**: Real-time price tracking from multiple sources (Scryfall, TCGPlayer, Card Kingdom, etc.)
- **Condition Tracking**: Monitor card conditions and foil status
- **Statistics Dashboard**: View total cards, collection value, and unique cards

### 🔍 Card Search & Discovery
- **Advanced Search**: Search by name, color, type, set, and more
- **Card Variations**: View all printings and variations of cards
- **Visual Results**: Card images and detailed information
- **Add from Search**: Easily add cards directly from search results

### 📊 Price Tracking
- **Multiple Sources**: Compare prices across different platforms
- **Price History**: Track value changes over time
- **Collection Value**: Real-time total collection valuation
- **Price Alerts**: Get notified of significant price changes (coming soon)

### 📚 Rules & Reference
- **MTG Rules**: Comprehensive rules reference with search
- **Dictionary**: Searchable MTG terminology and keywords
- **Mechanics Guide**: Detailed explanations of game mechanics
- **Format Information**: Rules for different play formats

### 🚀 PWA Features
- **📱 Install on Phone**: Works like a native mobile app
- **🔄 Offline Support**: Access your collection without internet
- **💾 Smart Caching**: Faster loading with intelligent caching
- **🔔 Update Notifications**: Automatic updates with user notification
- **🏠 Home Screen**: Add to home screen on any device

## 🚀 Quick Start

### Option 1: Local Testing (Recommended)
1. **Double-click `start-server.bat`** (Windows) or run `python serve.py` (Mac/Linux)
2. **Open https://localhost:8443** in your browser
3. **Accept the security warning** (self-signed certificate)
4. **Start using your PWA!**

### Option 2: Generate Icons First
1. **Open `icon-generator.html`** in your browser
2. **Download all the generated icons** to the `icons/` folder
3. **Follow Option 1** to start the server

### Option 3: Deploy Online
See `PWA-DEPLOYMENT-GUIDE.md` for detailed deployment instructions to:
- GitHub Pages (Free)
- Netlify (Free)
- Vercel (Free)
- Firebase Hosting (Free)

## 📁 Project Structure

```
mtg_collection_tracker/
├── 📄 index.html              # Main application
├── 🎨 styles.css              # Responsive styling
├── ⚙️ script.js               # Core application logic
├── 💰 price-tracker.js        # Price tracking functionality
├── 📱 manifest.json           # PWA manifest
├── 🔧 sw.js                   # Service worker for offline support
├── 🌐 offline.html            # Offline fallback page
├── 🎯 icon-generator.html     # Tool to create app icons
├── 🐍 serve.py                # Local HTTPS server
├── 🪟 start-server.bat        # Windows server launcher
├── 📖 PWA-DEPLOYMENT-GUIDE.md # Detailed deployment guide
├── 📋 README.md               # This file
└── 📁 icons/                  # App icons (generate with icon-generator.html)
```

## 📱 Installing on Your Phone

### Android (Chrome/Edge):
1. Open your deployed app URL in Chrome
2. Tap **⋮ Menu** → **"Add to Home screen"** or **"Install app"**
3. Confirm installation
4. App appears on home screen like a native app

### iPhone (Safari):
1. Open your deployed app URL in Safari
2. Tap **Share button** (□↗)
3. Scroll down and tap **"Add to Home Screen"**
4. Customize name and tap **"Add"**
5. App appears on home screen

### Desktop (Chrome/Edge):
1. Open your deployed app
2. Look for **install button** (⊕) in address bar
3. Click **"Install"** when prompted
4. App opens in its own window

## 🔧 PWA Features Explained

### 🔄 Offline Functionality
- **Collection Viewing**: Browse saved cards without internet
- **Rules & Dictionary**: Access MTG reference materials offline
- **Cached Images**: Previously loaded card images work offline
- **Smart Sync**: Changes sync when connection returns

### 💾 Caching Strategy
- **App Shell**: HTML, CSS, JS cached for instant loading
- **API Responses**: Scryfall data cached for offline access
- **Images**: Card images cached with smart updates
- **Dynamic Content**: Network-first with cache fallback

### 🔔 Update System
- **Automatic Updates**: New versions download in background
- **User Notifications**: Alerts when updates are available
- **One-Click Updates**: Seamless updates without data loss

## 🛠️ Development

### Prerequisites
- Modern web browser (Chrome, Edge, Firefox, Safari)
- Python 3.6+ (for local testing)
- Text editor or IDE

### Local Development
```bash
# Clone or download the project
cd mtg_collection_tracker

# Start local HTTPS server
python serve.py

# Or use the batch file on Windows
start-server.bat
```

### Testing PWA Features
1. **Open Chrome DevTools** → Application tab
2. **Check Manifest**: Verify manifest.json loads correctly
3. **Check Service Worker**: Ensure sw.js registers successfully
4. **Test Offline**: Use DevTools to simulate offline mode
5. **Run Lighthouse**: Audit → Progressive Web App

## 🎨 Customization

### Changing Colors
Edit `manifest.json`:
```json
{
  "theme_color": "#66BB6A",
  "background_color": "#E6F3FF"
}
```

### Adding Shortcuts
Edit `manifest.json` shortcuts array:
```json
{
  "shortcuts": [
    {
      "name": "Quick Add",
      "url": "/?action=add-card",
      "icons": [{"src": "icons/icon-192x192.png", "sizes": "192x192"}]
    }
  ]
}
```

### Modifying Offline Experience
Edit `offline.html` to customize the offline page with your branding and features.

## 🚨 Troubleshooting

### PWA Install Button Not Showing
- ✅ Ensure you're using HTTPS (required for PWA)
- ✅ Check manifest.json is valid
- ✅ Verify service worker registers successfully
- ✅ Test in Chrome/Edge (best PWA support)

### Service Worker Issues
- ✅ Check browser console for errors
- ✅ Ensure sw.js is in root directory
- ✅ Clear browser cache and reload
- ✅ Verify HTTPS is enabled

### Icons Not Displaying
- ✅ Generate icons using `icon-generator.html`
- ✅ Save all icons to `icons/` folder
- ✅ Check filenames match manifest.json exactly
- ✅ Ensure icons are PNG format

## 📈 Performance

- **⚡ Fast Loading**: Optimized caching and lazy loading
- **📱 Mobile Optimized**: Touch-friendly interface
- **🔄 Offline Ready**: Works without internet connection
- **💾 Smart Storage**: Efficient use of device storage
- **🚀 Native Feel**: App-like experience on all devices

## 🔒 Privacy & Security

- **🏠 Local Storage**: All data stored locally on your device
- **🔐 No Tracking**: No analytics or user tracking
- **🌐 API Calls**: Only to Scryfall for card data (public API)
- **🔒 Secure**: HTTPS required for full PWA functionality

## 🤝 Contributing

This is a personal collection tracker, but feel free to:
- Report bugs or issues
- Suggest new features
- Fork and customize for your needs
- Share improvements

## 📄 License

This project is open source and available under the MIT License.

## 🎉 Enjoy!

Your MTG Collection Tracker is now a fully functional Progressive Web App! Install it on your phone, use it offline, and enjoy tracking your Magic cards wherever you go! 🃏✨

---

**Need Help?** Check the `PWA-DEPLOYMENT-GUIDE.md` for detailed instructions, or open an issue if you encounter problems.
