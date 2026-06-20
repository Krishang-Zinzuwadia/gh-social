import React from 'react';
import { View, Text } from 'react-native';

const bold = { fontFamily: 'NotoSans_700Bold' };

export default function ProfileScreen() {
  return (
    <View className="flex-1 bg-[#111111] items-center justify-center">
      <Text className="text-white text-lg" style={bold}>Profile</Text>
    </View>
  );
}