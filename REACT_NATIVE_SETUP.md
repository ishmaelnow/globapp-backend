# React Native Mobile App Setup

## Project Structure

We'll create a React Native app that connects to your existing API at `https://globapp.app/api/v1`

## Prerequisites

1. **Node.js** (v18 or higher)
2. **React Native CLI**: `npm install -g react-native-cli`
3. **For iOS**: Xcode (Mac only)
4. **For Android**: Android Studio

## Quick Start

```bash
# Create new React Native project
npx react-native@latest init GlobAppMobile --template react-native-template-typescript

# Or use Expo (easier for beginners)
npx create-expo-app GlobAppMobile --template
```

## Project Location

We'll create it in: `mobile-app/` (separate from web apps)

## API Configuration

- **Base URL**: `https://globapp.app/api/v1`
- **Public API Key**: Same as web apps
- **Endpoints**: All existing endpoints work

## Next Steps

1. Create project structure
2. Set up API service
3. Create navigation
4. Build Rider screens
5. Build Driver screens
6. Build Admin screens (optional)

