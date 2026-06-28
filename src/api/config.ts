import { Platform } from 'react-native';
import Constants from 'expo-constants';

export const getApiUrl = (): string => {
  // 1. Production / User-defined environment variable (Highest Priority)
  // This is what will be used in GitHub/Vercel/EAS deployments
  if (process.env.EXPO_PUBLIC_BACKEND_URL) {
    return process.env.EXPO_PUBLIC_BACKEND_URL;
  }

  // 2. Development fallbacks (if no env variable is provided)
  if (process.env.NODE_ENV !== 'production') {
    // Try to dynamically resolve the host LAN IP (works perfectly on Expo Go for mobile devices)
    if (Constants.expoConfig?.hostUri) {
      return `http://${Constants.expoConfig.hostUri.split(':')[0]}:5000/api`;
    }
    
    // Fallback for Android Emulator
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:5000/api';
    }
    
    // Fallback for iOS Simulator or Web
    return 'http://localhost:5000/api';
  }

  // 3. Final Production Fallback (Safety net if deployed without setting the env var)
  return 'https://api.yourdomain.com/api';
};

export const API_URL = getApiUrl();
