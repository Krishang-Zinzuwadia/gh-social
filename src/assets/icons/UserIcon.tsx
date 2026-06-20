import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import { ColorValue } from 'react-native';

interface IconProps {
  color?: ColorValue;
  size?: number;
}

export function UserIcon({ color = '#6B7280', size = 22 }: IconProps): React.JSX.Element {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="8" r="4" stroke={color as string} strokeWidth={2} />
      <Path
        d="M4 20C4 17.0 7.58172 14 12 14C16.4183 14 20 17.0 20 20"
        stroke={color as string}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}