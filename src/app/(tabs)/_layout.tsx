import { Tabs } from 'expo-router';
import { useEffect, useMemo, type ReactNode } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  View,
  type ColorValue,
  type GestureResponderEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import { BlurView } from 'expo-blur';

import { APP_THEME } from '../../constants/theme';

const ICON_SIZE = 21;
const ICON_SLOT_SIZE = 31;

type TabIconProps = {
  color: ColorValue;
  focused: boolean;
};

function TabIconFrame({ focused, children }: { focused: boolean; children: ReactNode }) {
  const glowProgress = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    Animated.timing(glowProgress, {
      toValue: focused ? 1 : 0,
      duration: focused ? 220 : 160,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [focused, glowProgress]);

  return (
    <View style={styles.iconFrame}>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.activeGlow,
          {
            opacity: glowProgress,
            transform: [
              {
                scale: glowProgress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.7, 1],
                }),
              },
            ],
          },
        ]}
      />
      <Animated.View
        style={{
          opacity: glowProgress.interpolate({
            inputRange: [0, 1],
            outputRange: [0.78, 1],
          }),
          transform: [
            {
              scale: glowProgress.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 1.045],
              }),
            },
          ],
        }}
      >
        {children}
      </Animated.View>
    </View>
  );
}

function HomeIcon({ color, focused }: TabIconProps) {
  return (
    <Svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill={focused ? color : 'none'}>
      <Path
        d="M3 10.5 12 3l9 7.5V21h-6v-6h-6v6H3V10.5Z"
        stroke={color}
        strokeWidth={1.8}
      />
    </Svg>
  );
}

function ExploreIcon({ color }: TabIconProps) {
  return (
    <Svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none">
      <Circle cx={11} cy={11} r={7.5} stroke={color} strokeWidth={1.8} />
      <Path d="m20.5 20.5-4-4" stroke={color} strokeWidth={1.8} />
    </Svg>
  );
}

function ProfileIcon({ color }: TabIconProps) {
  return (
    <Svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={8} r={4} stroke={color} strokeWidth={1.8} />
      <Path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" stroke={color} strokeWidth={1.8} />
    </Svg>
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      initialRouteName="home"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: APP_THEME.activeAccent,
        tabBarInactiveTintColor: APP_THEME.inactiveAccent,
        tabBarActiveBackgroundColor: 'transparent',
        tabBarInactiveBackgroundColor: 'transparent',
        tabBarAllowFontScaling: false,
        tabBarLabelPosition: 'below-icon',
        tabBarLabelStyle: styles.label,
        tabBarIconStyle: styles.icon,
        tabBarItemStyle: styles.item,
        tabBarBackground: () => (
          <BlurView
            blurMethod="dimezisBlurViewSdk31Plus"
            intensity={72}
            tint="dark"
            style={[StyleSheet.absoluteFill, styles.barBackground]}
          />
        ),
        tabBarStyle: [
          styles.bar,
          {
            height: 54 + Math.max(insets.bottom, 5),
            paddingBottom: Math.max(insets.bottom, 5),
            paddingLeft: Math.max(8, insets.left),
            paddingRight: Math.max(8, insets.right),
          },
        ],
        tabBarButton: ({
          'aria-selected': selected,
          accessibilityLabel,
          accessibilityState,
          children,
          onLongPress,
          onPress,
          style,
          testID,
        }) => (
          <Pressable
            accessibilityLabel={accessibilityLabel}
            accessibilityRole="tab"
            accessibilityState={{ ...accessibilityState, selected }}
            onLongPress={onLongPress}
            onPress={onPress as (event: GestureResponderEvent) => void}
            style={[style, styles.button]}
            testID={testID}
          >
            {children}
          </Pressable>
        ),
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabIconFrame focused={focused}>
              <HomeIcon color={color} focused={focused} />
            </TabIconFrame>
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, focused }) => (
            <TabIconFrame focused={focused}>
              <ExploreIcon color={color} focused={focused} />
            </TabIconFrame>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <TabIconFrame focused={focused}>
              <ProfileIcon color={color} focused={focused} />
            </TabIconFrame>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0,
    paddingTop: 2,
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    elevation: 18,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.34,
    shadowRadius: 18,
  },
  barBackground: {
    overflow: 'hidden',
    backgroundColor: 'rgba(8,10,9,0.92)',
  },
  item: {
    flex: 1,
    padding: 0,
  },
  button: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
  },
  icon: {
    width: ICON_SLOT_SIZE,
    height: ICON_SLOT_SIZE,
    margin: 0,
  },
  iconFrame: {
    width: ICON_SLOT_SIZE,
    height: ICON_SLOT_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeGlow: {
    position: 'absolute',
    width: 25,
    height: 25,
    borderRadius: 12.5,
    backgroundColor: 'rgba(255,255,255,0.08)',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.42,
    shadowRadius: 10,
    elevation: 7,
  },
  label: {
    marginTop: -4,
    marginBottom: 0,
    fontFamily: 'NataSans-Medium',
    fontSize: 10,
    fontWeight: '500',
    lineHeight: 12,
  },
});
