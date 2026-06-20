import '@/global.css';
import { NotoSans_400Regular, NotoSans_700Bold, useFonts } from '@expo-google-fonts/noto-sans';
import { Tabs } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import HomeIcon from '../assets/icons/Vector (1).svg';
import CompassIcon from '../assets/icons/material-symbols_explore-outline.svg';
import UserIcon from '../assets/icons/Vector (2).svg';
import { APP_THEME } from '../constants/theme';

export default function Layout() {
  const [fontsLoaded] = useFonts({
    NotoSans_400Regular,
    NotoSans_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: APP_THEME.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={APP_THEME.activeAccent} />
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: APP_THEME.tabBarBackground,
          borderTopColor: APP_THEME.tabBarBorder,
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
          tabBarIcon: ({ focused }) => (
            <HomeIcon fill={focused ? APP_THEME.activeAccent : APP_THEME.inactiveAccent} width={22} height={22} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Trending',
          tabBarIcon: ({ focused }) => (
            <CompassIcon fill={focused ? APP_THEME.activeAccent : APP_THEME.inactiveAccent} width={30} height={31} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => (
            <UserIcon fill={focused ? APP_THEME.activeAccent : APP_THEME.inactiveAccent} width={22} height={22} />
          ),
        }}
      />
    </Tabs>
  );
}