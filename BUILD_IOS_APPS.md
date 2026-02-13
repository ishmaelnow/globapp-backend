# Building iOS Apps - Step by Step Guide

## Prerequisites

1. **Apple Developer Account** ($99/year)
   - Sign up at: https://developer.apple.com/programs/
   - Required for App Store submission

## Building iOS Apps

iOS builds require interactive prompts that need to be run in your terminal. Here's how to build each app:

### 1. Admin App

```bash
cd C:\Users\koshi\cursor-apps\admin-mobile-pwa
eas build --platform ios --profile production
```

**When prompted:**
- **"iOS app only uses standard/exempt encryption?"** → Type `y` (yes) and press Enter
  - This means your app uses standard HTTPS encryption (which all apps do)
- **Apple Developer Account** → You'll be asked to sign in with your Apple ID
- **Distribution Certificate** → EAS will help you create/use one
- **Provisioning Profile** → EAS will handle this automatically

### 2. Driver App

```bash
cd C:\Users\koshi\cursor-apps\driver-mobile-pwa
eas build --platform ios --profile production
```

**Same prompts as above:**
- Encryption: `y`
- Sign in with Apple Developer account
- Follow prompts for certificates

### 3. Rider App

```bash
cd C:\Users\koshi\cursor-apps\rider-mobile-pwa
eas build --platform ios --profile production
```

**Same prompts as above:**
- Encryption: `y`
- Sign in with Apple Developer account
- Follow prompts for certificates

## What to Expect

1. **First iOS Build:**
   - Will ask for Apple Developer account credentials
   - Will create/configure certificates (takes a few minutes)
   - Build time: 20-40 minutes

2. **Subsequent Builds:**
   - Faster (certificates already configured)
   - Build time: 15-30 minutes

3. **Build Output:**
   - `.ipa` file (iOS app package)
   - Download link provided when complete
   - Can be installed via TestFlight or Xcode

## Important Notes

- **Apple Developer Account Required**: You must have an active Apple Developer Program membership ($99/year)
- **First Time Setup**: The first iOS build will take longer as it sets up certificates
- **Encryption Question**: Answer `y` (yes) - your apps use standard HTTPS encryption
- **Build Monitoring**: You'll get a link to monitor build progress

## Troubleshooting

If you get errors about certificates:
- Make sure your Apple Developer account is active
- Ensure you're signed in with the correct Apple ID
- EAS will help create certificates if needed

## After Builds Complete

1. Download `.ipa` files
2. Install via TestFlight (recommended for testing)
3. Or use Xcode to install on devices
4. Submit to App Store when ready




























