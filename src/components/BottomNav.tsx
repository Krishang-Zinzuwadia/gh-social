import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { CompassIcon } from '../assets/icons/CompassIcon';
import { HomeIcon } from '../assets/icons/HomeIcon';
import { UserIcon } from '../assets/icons/UserIcon';
import { NavItem } from '../types';

interface NavItemConfig {
  name: NavItem;
  icon: (color: string) => React.JSX.Element;
}

const NAV_ITEMS: NavItemConfig[] = [
  { name: 'home', icon: (color) => <HomeIcon color={color} size={22} /> },
  { name: 'explore', icon: (color) => <CompassIcon color={color} size={22} /> },
  { name: 'profile', icon: (color) => <UserIcon color={color} size={22} /> },
];

interface BottomNavProps {
  activeItem?: NavItem;
  onItemPress?: (item: NavItem) => void;
}

export default function BottomNav({
  activeItem = 'home',
  onItemPress,
}: BottomNavProps): React.JSX.Element {
  return (
    <View className="flex-row items-center justify-around bg-[#111111] border-t border-[#2C2C2E] py-3 px-6">
      {NAV_ITEMS.map(({ icon, name }) => {
        const isActive = activeItem === name;
        const color = isActive ? '#22C55E' : '#6B7280';
        return (
          <TouchableOpacity
            key={name}
            onPress={() => onItemPress?.(name)}
            className="items-center justify-center p-2"
            activeOpacity={0.7}
          >
            {icon(color)}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}