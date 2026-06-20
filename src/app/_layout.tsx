import '@/global.css';
// app/_layout.tsx
import { NotoSans_400Regular, NotoSans_700Bold, useFonts } from '@expo-google-fonts/noto-sans';
import { Tabs } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import HomeIcon from '../assets/icons/Vector (1).svg';
import CompassIcon from '../assets/icons/material-symbols_explore-outline.svg';
import UserIcon from '../assets/icons/Vector (2).svg';

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
          tabBarIcon: ({ color }) => <HomeIcon fill={color} width={22} height={22} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Trending',
          tabBarIcon: ({ color }) => <CompassIcon fill={color} width={22} height={22} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <UserIcon fill={color} width={22} height={22} />,
        }}
      />
    </Tabs>
  );
}