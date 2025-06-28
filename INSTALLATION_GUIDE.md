# 🔧 Installation & Setup Guide

## Quick Start

### 1. Install Dependencies
```powershell
cd c:\Users\upadh\Downloads\smartonboardai
npm install
```

### 2. Configure API Key
**Option A: Using Settings Screen (Recommended)**
1. Start the app: `npx expo start`
2. Navigate to Settings → API Configuration
3. Enter your Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
4. Test and save

**Option B: Using Environment File**
```powershell
# Copy the example file
copy .env.example .env

# Edit .env and add your actual API key
# GEMINI_API_KEY=your_actual_api_key_here
```

### 3. Start Development
```powershell
npx expo start
```

---

## 📱 Platform-Specific Setup

### iOS
```powershell
npx expo start --ios
```

### Android
```powershell
npx expo start --android
```

### Web Browser
```powershell
npx expo start --web
```

---

## 🔧 Troubleshooting

### If you see dependency errors:
```powershell
# Clear cache and reinstall
npm cache clean --force
rm -rf node_modules
rm package-lock.json
npm install
```

### If Metro bundler issues:
```powershell
npx expo start --clear
```

### For development build:
```powershell
npx expo install --fix
```

---

## ✅ Verification

After setup, verify the app works by:
1. ✅ App starts without errors
2. ✅ Navigation between screens works
3. ✅ Settings screen loads properly
4. ✅ API status banners appear if no API key
5. ✅ AI features work with valid API key

---

## 🆘 Common Issues

**"window.addEventListener is not a function"**
- ✅ Fixed: This error has been resolved

**"The action navigate with payload was not handled"**
- ✅ Fixed: Navigation issues have been resolved

**"403 PERMISSION_DENIED" or API errors**
- ✅ Fixed: Enhanced error handling with clear user guidance
- 🔑 Action needed: Configure your Gemini API key

**Red/Yellow banners in app**
- 🔴 Red: API authentication issue - check API key
- 🟡 Yellow: API quota issue - temporary, will resolve

---

## 📊 Features Status

| Feature | Status | Notes |
|---------|--------|-------|
| App Navigation | ✅ Working | All screens accessible |
| Source Detection | ✅ Working | Instagram, referral, blog, direct |
| Content Analysis | ✅ Working | With API key; fallbacks without |
| User Profiles | ✅ Working | Personalized recommendations |
| Analytics | ✅ Working | Source tracking and insights |
| API Key Management | ✅ Working | Secure storage and validation |
| Error Handling | ✅ Working | User-friendly error messages |
| Offline Mode | ✅ Working | Graceful degradation |

---

Ready to develop! 🚀
