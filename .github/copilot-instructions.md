<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# SmartOnboardAI - Source-Adaptive Experience App

This React Native application uses Expo for a cross-platform mobile experience. The app demonstrates intelligent source detection and personalized content adaptation using Gemini AI.

## Key Features

- Source detection (Instagram, referrals, blogs, direct traffic)
- Personalized content based on user source
- Gemini AI-driven content analysis and recommendations
- Animated UI transitions for engaging user experience
- Source analytics dashboard
- Deep linking system to capture and maintain referral sources

## Project Structure

- `src/components/`: Reusable UI components
- `src/constants/`: App constants, theme, and mock data
- `src/contexts/`: React context for global state management
- `src/hooks/`: Custom React hooks
- `src/navigation/`: App navigation setup
- `src/screens/`: App screens components
- `src/services/`: Services for AI, analytics, and user data
- `src/types/`: TypeScript type definitions
- `src/utils/`: Utility functions, including source detection

## Design Patterns

- Use React hooks for state management
- Follow the container/presentational component pattern
- Implement context for global state
- Use TypeScript for type safety
- Implement animated transitions for better UX
- Use service-oriented architecture for business logic

## Style Guidelines

- Follow component naming conventions (PascalCase for components)
- Use consistent styling with the defined theme
- Implement responsive design for different screen sizes
- Follow accessibility best practices
