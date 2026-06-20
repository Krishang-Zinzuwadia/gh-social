import React from 'react';
import Svg, { Line, Rect } from 'react-native-svg';

interface IconProps { color?: string; size?: number; }

export function MonitorIcon({ color = '#6B7280', size = 18 }: IconProps): React.JSX.Element {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="2" y="3" width="20" height="14" rx="2" ry="2" stroke={color} strokeWidth={2} />
      <Line x1="8" y1="21" x2="16" y2="21" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Line x1="12" y1="17" x2="12" y2="21" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}