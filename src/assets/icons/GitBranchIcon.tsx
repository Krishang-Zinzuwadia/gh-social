import React from 'react';
import Svg, { Circle, Line, Path } from 'react-native-svg';

interface IconProps { color?: string; size?: number; }

export function GitBranchIcon({ color = '#9CA3AF', size = 12 }: IconProps): React.JSX.Element {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line x1="6" y1="3" x2="6" y2="15" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Circle cx="18" cy="6" r="3" stroke={color} strokeWidth={2} />
      <Circle cx="6" cy="18" r="3" stroke={color} strokeWidth={2} />
      <Path d="M18 9a9 9 0 0 1-9 9" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}