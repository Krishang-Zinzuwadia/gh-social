import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { MenuIcon } from '../assets/icons/MenuIcon';

interface HeaderProps {
  onMenuPress?: () => void;
}

const bold = { fontFamily: 'NotoSans_700Bold' };

export default function Header({ onMenuPress }: HeaderProps): React.JSX.Element {
  return (
    <View className="flex-row items-center justify-between px-4 py-3 bg-[#111111]">
      <TouchableOpacity onPress={onMenuPress} className="p-1">
        <MenuIcon color="#FFFFFF" size={22} />
      </TouchableOpacity>
      <Text className="text-white text-base tracking-wide" style={bold}>
        githubsocial
      </Text>
      <View className="bg-[#22C55E] rounded-lg px-2 py-1 items-center justify-center">
        <Text className="text-black text-xs" style={bold}>{'</>'}</Text>
      </View>
    </View>
  );
}