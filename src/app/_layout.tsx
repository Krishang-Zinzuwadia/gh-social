import '@/global.css';
import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from "expo-router";
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { AuthProvider, useAuth } from '../store/AuthContext';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboardingGroup = segments[0] === 'onboarding';

    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (user) {
      if (user.onboarding_completed === false && !inOnboardingGroup) {
        router.replace('/onboarding/create-profile');
      } else if (user.onboarding_completed === true && (inAuthGroup || inOnboardingGroup)) {
        router.replace('/(tabs)/explore');
      }
    }
  }, [user, isLoading, segments, router]);

  return <Stack screenOptions={{ headerShown: false }} />;
}

const queryClient = new QueryClient();

export default function Layout() {
  const [loaded, error] = useFonts({
    'NataSans-Regular': require('../../assets/fonts/NataSans-Regular.ttf'),
    'NataSans-Medium': require('../../assets/fonts/NataSans-Medium.ttf'),
    'NataSans-SemiBold': require('../../assets/fonts/NataSans-SemiBold.ttf'),
    'NataSans-Bold': require('../../assets/fonts/NataSans-Bold.ttf'),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AuthProvider>
          <RootLayoutNav />
        </AuthProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
