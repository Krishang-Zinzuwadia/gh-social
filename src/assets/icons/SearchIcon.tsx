import React from 'react';
import Svg, { Circle, Line } from 'react-native-svg';

interface IconProps { color?: string; size?: number; }

export function SearchIcon({ color = '#6B7280', size = 16 }: IconProps): React.JSX.Element {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="11" cy="11" r="8" stroke={color} strokeWidth={2} />
      <Line x1="21" y1="21" x2="16.65" y2="16.65" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}