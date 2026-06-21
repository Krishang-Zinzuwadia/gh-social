import React from 'react';
import { View, StyleSheet, Pressable, Platform } from 'react-native';
import { House, Compass, User } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface BottomNavProps {
  activeTab: 'home' | 'discover' | 'profile';
  onTabPress: (tab: 'home' | 'discover' | 'profile') => void;
}

export function BottomNav({ activeTab, onTabPress }: BottomNavProps) {
  const insets = useSafeAreaInsets();
  
  const tabs = [
    { id: 'home' as const, Icon: House, label: 'Home' },
    { id: 'discover' as const, Icon: Compass, label: 'Discover' },
    { id: 'profile' as const, Icon: User, label: 'Profile' },
  ];

  return (
    <View style={[
      styles.navBarContainer, 
      { paddingBottom: Platform.OS === 'web' ? 16 : Math.max(insets.bottom, 12) }
    ]}>
      {/* Outer border wrapper */}
      <View style={styles.navBarBorder} />
      
      {/* Inner tabs wrapper */}
      <View style={styles.tabsWrapper}>
        {tabs.map(({ id, Icon }) => {
          const isActive = activeTab === id;
          return (
            <Pressable
              key={id}
              onPress={() => onTabPress(id)}
              style={({ pressed }) => [
                styles.tabButton,
                pressed && styles.tabPressed
              ]}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
            >
              <Icon 
                size={24} 
                strokeWidth={isActive ? 2 : 1.75} 
                color={isActive ? '#8EFF7A' : '#808581'} 
                style={isActive ? styles.glowActive : null}
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#030504', // Very dark/near-black footer background
    zIndex: 999,
  },
  navBarBorder: {
    height: 1,
    backgroundColor: 'rgba(142, 255, 122, 0.1)', // Very faint green separator line
    width: '100%',
  },
  tabsWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 64,
    paddingHorizontal: 32,
  },
  tabButton: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabPressed: {
    opacity: 0.7,
  },
  glowActive: {
    shadowColor: '#8EFF7A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
});
