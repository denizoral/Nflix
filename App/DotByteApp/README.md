# DotByte Mobile App

A React Native mobile app for the DotByte video streaming platform.

## Features

- 🔐 User authentication (login/register)
- 🎬 Browse and search movies
- ▶️ Video streaming with custom controls
- 👤 User profile management
- 📱 Netflix-style mobile interface
- 🌙 Dark theme optimized for mobile

## Prerequisites

- Node.js (v16 or higher)
- Expo CLI (`npm install -g @expo/cli`)
- Android device/emulator or iOS device/simulator
- DotByte backend server running on `http://localhost:5000`

## Installation

1. Navigate to the mobile app directory:
   ```bash
   cd App/DotByteApp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npx expo start
   ```

4. Run on your device:
   - For Android: Press `a` in the terminal or scan the QR code with Expo Go app
   - For iOS: Press `i` in the terminal or scan the QR code with Camera app

## API Configuration

The app is configured to connect to the DotByte backend at `http://localhost:5000/api`. 

**Important**: When running on a physical device, you may need to update the API base URL in `src/services/api.ts` to use your computer's IP address instead of `localhost`.

For example, change:
```typescript
const API_BASE_URL = 'http://localhost:5000/api';
```

To:
```typescript
const API_BASE_URL = 'http://YOUR_COMPUTER_IP:5000/api';
```

## Demo Login

You can use the demo admin account to test the app:
- Username: `admin`
- Password: `admin123`

## App Structure

```
src/
├── contexts/         # React contexts (Auth)
├── navigation/       # Navigation configuration
├── screens/         # App screens
├── services/        # API services
└── components/      # Reusable components (if any)
```

## Screens

- **Login/Register**: User authentication
- **Home**: Featured movies and quick access
- **Movies**: Browse and search all movies
- **Movie Player**: Full-screen video player
- **Profile**: User profile and app settings

## Building for Production

To build the app for production:

```bash
# For Android
npx expo build:android

# For iOS
npx expo build:ios
```

## Troubleshooting

1. **Network Error**: Ensure the backend server is running and accessible
2. **Video Won't Play**: Check the API URL configuration and network connectivity
3. **App Won't Start**: Try clearing cache with `npx expo start --clear`

## Notes

- The app uses session-based authentication to sync with the web platform
- Video streaming uses the Expo AV component for cross-platform compatibility
- The UI is optimized for mobile with touch-friendly controls