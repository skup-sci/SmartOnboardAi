# SmartOnboardAI

[![Netlify Status](https://api.netlify.com/api/v1/badges/cdaccf6e-xxxx-xxxx-xxxx-xxxxxxxxxxxx/deploy-status)](https://papaya-panda-cdaccf.netlify.app/)

## 🚀 Live Demo

👉 [View the deployed app on Netlify](https://papaya-panda-cdaccf.netlify.app/)

A Source-Adaptive Experience app that leverages AI to personalize content based on where users come from. Built with React Native and Expo, with Gemini AI integration.

## Features

- 🔍 **Intelligent Source Detection**: Automatically detects if users come from Instagram, referrals, blogs, or direct visits
- 🧠 **AI-Powered Personalization**: Uses Gemini AI to analyze content and match it to different user sources
- 📊 **Source Analytics Dashboard**: Track user origins and engagement patterns
- 🎯 **Content Adaptation**: Displays the most relevant content based on where users came from
- 🔄 **Deep Linking**: Complete system to capture and maintain referral sources
- 📱 **Cross-Platform**: Works on iOS, Android, and web

## Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env file and add your API keys

# Start the development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on web
npm run web
```

## Environment Variables

This app requires API keys for its functionality. Create a `.env` file in the root directory with the following variables:

```
GEMINI_API_KEY=your_gemini_api_key_here
```

For security reasons, never commit your `.env` file to version control. The app uses secure storage to protect API keys on device.

## Project Structure

```
src/
  ├── assets/         # Images, icons, etc.
  ├── components/     # Reusable UI components
  ├── constants/      # App constants and theme
  ├── contexts/       # React contexts
  ├── hooks/          # Custom React hooks
  ├── navigation/     # Navigation configuration
  ├── screens/        # App screens
  ├── services/       # API and business logic services
  ├── types/          # TypeScript type definitions
  └── utils/          # Utility functions
```

## Source Detection

The app detects user sources through:

- UTM parameters in links
- Referrer information
- Deep linking parameters
- Manual source selection (for demo purposes)

## AI Integration

The app uses Google's Gemini AI to:

- Analyze content relevance for different sources
- Generate personalized recommendations
- Create customized welcome messages
- Predict user interests based on viewed content

## Demo Sources

For demonstration purposes, you can simulate different traffic sources:

- Instagram
- Referral
- Blog
- Direct
- Unknown

## License

MIT
