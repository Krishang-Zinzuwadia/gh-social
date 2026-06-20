import '@/global.css';
// app/_layout.tsx
import '../global.css';
import { NotoSans_400Regular, NotoSans_700Bold, useFonts } from '@expo-google-fonts/noto-sans';
import { Tabs } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { HomeIcon } from '../assets/icons/HomeIcon';
import { CompassIcon } from '../assets/icons/CompassIcon';
import { UserIcon } from '../assets/icons/UserIcon';

export default function Layout() {
  const [fontsLoaded] = useFonts({
    NotoSans_400Regular,
    NotoSans_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: '#111111', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#22C55E" />
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#111111',
          borderTopColor: '#2C2C2E',
        },
        tabBarActiveTintColor: '#22C55E',
        tabBarInactiveTintColor: '#6B7280',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'For You',
          tabBarIcon: ({ color }) => <HomeIcon color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Trending',
          tabBarIcon: ({ color }) => <CompassIcon color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <UserIcon color={color} size={22} />,
        }}
      />
    </Tabs>
  );
}