import '@/global.css';
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
      <View style={{ flex: 1, backgroundColor: '#0A0C09', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#6DA963" />
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0A0C09',
          borderTopColor: '#242524',
          height: 60,
        },
        tabBarItemStyle: {
          justifyContent: 'center',
          alignItems: 'center',
          height: 60,
          paddingTop: 0,
          paddingBottom: 0,
        },
        tabBarIconStyle: {
          justifyContent: 'center',
          alignItems: 'center',
          alignSelf: 'center',
          marginTop: 0,
          marginBottom: 0,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'For You',
          tabBarIcon: () => <HomeIcon fill="#FFFFFF" width={22} height={22} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Trending',
          tabBarIcon: () => <CompassIcon fill="#6DA963" width={30} height={31} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: () => <UserIcon fill="#FFFFFF" width={22} height={22} />,
        }}
      />
    </Tabs>
  );
}