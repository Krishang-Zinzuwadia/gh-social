import React from 'react';
import { View, Text } from 'react-native';

const regular = { fontFamily: 'NotoSans_400Regular' };
const bold = { fontFamily: 'NotoSans_700Bold' };

export default function ProfileScreen() {
  return (
    <View className="flex-1 bg-[#111111] items-center justify-center">
      <Text className="text-white text-lg" style={bold}>Profile</Text>
    </View>
  );
}