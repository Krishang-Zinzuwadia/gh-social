import { Tabs } from 'expo-router';
import { Home, Search, User } from 'lucide-react-native';

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
        tabBarActiveTintColor: '#8EFF7A',
        tabBarInactiveTintColor: '#FFFFFF',
        tabBarStyle: {
          backgroundColor: '#090B08',
          borderTopColor: '#090B08',
          borderTopWidth: 0.5,
          height: 84,
          paddingTop: 10,
          paddingHorizontal: 8,
          paddingBottom: 0,
          elevation: 0,
          boxShadow: 'none',
        },
        tabBarItemStyle: {
          paddingTop: 2,
          paddingBottom: 0,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home color={color} size={24} strokeWidth={1.8} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <Search color={color} size={24} strokeWidth={1.8} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <User color={color} size={24} strokeWidth={1.8} />,
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
