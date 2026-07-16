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
      return `http://${Constants.expoConfig.hostUri.split(':')[0]}:5001/api`;
    }
    
    // Fallback for Android Emulator
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:5001/api';
    }
    
    // Fallback for iOS Simulator or Web
    return 'http://localhost:5001/api';
  }

  // 3. Final Production Fallback
  // If we reach here in production, it means the developer forgot to set the environment variable.
  // We log an explicit error to fail fast but return a dummy URL so the app gracefully shows the 
  // 'Service Unavailable' screen instead of fatally crashing during module load.
  console.error('CRITICAL: EXPO_PUBLIC_BACKEND_URL environment variable is missing. You must configure this in your production environment.');
  return 'http://MISSING_CONFIG';
};

export const API_URL = getApiUrl();
