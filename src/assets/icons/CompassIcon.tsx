import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import { ColorValue } from 'react-native';

interface IconProps {
  color?: ColorValue;
  size?: number;
}

export function CompassIcon({ color = '#6B7280', size = 22 }: IconProps): React.JSX.Element {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={color as string} strokeWidth={2} />
      <Path
        d="M16.24 7.76L14.12 14.12L7.76 16.24L9.88 9.88L16.24 7.76Z"
        stroke={color as string}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}