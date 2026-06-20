import React from 'react';
import { Text, View } from 'react-native';

const bold = { fontFamily: 'NotoSans_700Bold' };

export default function Header(): React.JSX.Element {
  return (
    <View className="flex-row items-center justify-center px-4 py-3 bg-[#111111]">
      <Text className="text-white text-base tracking-wide" style={bold}>
        githubsocial
      </Text>
    </View>
  );
}