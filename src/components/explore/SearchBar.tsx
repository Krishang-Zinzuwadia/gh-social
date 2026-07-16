import React from 'react';
import { TextInput, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

function SearchGlyph(): React.JSX.Element {
  return (
    <Svg width={15} height={15} viewBox="0 0 24 24" fill="none">
      <Circle cx={11} cy={11} r={7} stroke="rgba(235,235,245,0.4)" strokeWidth={2} />
      <Path d="m20 20-3.5-3.5" stroke="rgba(235,235,245,0.4)" strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

export default function SearchBar({
  value,
  onChangeText,
  placeholder = 'Repos, devs, topics',
}: SearchBarProps): React.JSX.Element {
  return (
    <View style={{ paddingTop: 14, paddingHorizontal: 20 }}>
      <View
        style={{
          height: 38,
          borderRadius: 12,
          backgroundColor: 'rgba(118, 118, 128, 0.18)',
          paddingHorizontal: 12,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <SearchGlyph />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="rgba(235,235,245,0.3)"
          style={{
            flex: 1,
            color: '#FFFFFF',
            fontSize: 15,
            padding: 0,
            borderWidth: 0,
          }}
        />
      </View>
    </View>
  );
}
