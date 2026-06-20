import React from 'react';
import { Text, View } from 'react-native';

interface AvatarProps {
  color: string;
  initial: string;
  size?: number;
}

export default function Avatar({ color, initial, size = 18 }: AvatarProps): React.JSX.Element {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ color: '#fff', fontSize: size * 0.5, fontFamily: 'NotoSans_700Bold' }}>
        {initial}
      </Text>
    </View>
  );
}