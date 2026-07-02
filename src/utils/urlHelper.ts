import * as Linking from 'expo-linking';
import { Platform } from 'react-native';

export function getAuthCallbackUrl(): string {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/auth/callback`;
    }
    // Fallback for SSR or non-browser environments
    return `${process.env.EXPO_PUBLIC_CLIENT_URL || 'http://localhost:3000'}/auth/callback`;
  }
  return Linking.createURL('auth/callback');
}
