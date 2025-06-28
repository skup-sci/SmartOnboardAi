# API Key Setup Guide

## Authentication Error: PERMISSION_DENIED

If you're seeing an authentication error (403 PERMISSION_DENIED), it means the Gemini API key is missing, invalid, or not properly configured.

## How to Fix

### Option 1: Configure via Settings Screen (Recommended)
1. Open the app and navigate to Settings
2. Find the "API Configuration" section
3. Enter your Gemini API key
4. Tap "Test API Key" to verify it works
5. Save the configuration

### Option 2: Configure via Environment File
1. Copy `.env.example` to `.env` in the project root
2. Replace `your_gemini_api_key_here` with your actual API key
3. Restart the development server

## Getting Your API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated key
5. Keep this key secure and private

## API Key Format

- Gemini API keys are typically 30+ characters long
- They contain letters, numbers, hyphens, and underscores
- Example format: `AIzaSyABC123def456GHI789jkl012MNO345pqr678`

## Troubleshooting

### Common Issues:

1. **Invalid API Key Format**
   - Check that your key is copied completely
   - Ensure no extra spaces at the beginning or end
   - Verify the key contains only valid characters

2. **403 PERMISSION_DENIED**
   - The API key is invalid or expired
   - The key doesn't have proper permissions
   - The Gemini API isn't enabled for your Google account

3. **Quota Exceeded**
   - You've reached the API usage limits
   - Wait for the quota to reset or upgrade your plan
   - The app will show a yellow banner for quota issues

### Error Banner Colors:
- **Red Banner**: Authentication errors (need to fix API key)
- **Yellow Banner**: Quota/rate limit issues (temporary)

## App Behavior Without API Key

The app will still work without a valid API key, but:
- AI-powered personalization will be disabled
- Fallback recommendations will be used instead
- A banner will appear notifying you of the limitation

## Security Notes

- Never commit your `.env` file to version control
- Keep your API keys confidential
- Regenerate keys if you suspect they've been compromised
- Use the Settings screen for secure key storage on mobile devices
