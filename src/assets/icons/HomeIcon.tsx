import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { ColorValue } from 'react-native';

interface IconProps {
  color?: ColorValue;
  size?: number;
}

export function HomeIcon({ color = '#6B7280', size = 22 }: IconProps): React.JSX.Element {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 9.5L12 3L21 9.5V20C21 20.5523 20.5523 21 20 21H15V15H9V21H4C3.44772 21 3 20.5523 3 20V9.5Z"
        stroke={color as string}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}