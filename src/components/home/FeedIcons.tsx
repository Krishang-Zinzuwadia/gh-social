import React from 'react';
import GitForkSvg from '../../assets/icons/gg_git-fork.svg';
import EyeSvg from '../../assets/icons/Vector (2).svg';
import CommentSvg from '../../assets/icons/Vector (3).svg';
import ThumbsUpLogoSvg from '../../assets/icons/thumbsup.svg';
import ThumbsDownLogoSvg from '../../assets/icons/thumbsdown.svg';

export type HomeSvgIconProps = {
  size?: number;
  color?: string;
  strokeWidth?: number;
};

export function GitForkHomeIcon({ size = 16 }: HomeSvgIconProps) {
  return <GitForkSvg width={size} height={size} />;
}

export function EyeHomeIcon({ size = 16 }: HomeSvgIconProps) {
  return <EyeSvg width={size} height={size} />;
}

export function CommentHomeIcon({ size = 16 }: HomeSvgIconProps) {
  return <CommentSvg width={size} height={size} />;
}

export function ThumbsUpHomeIcon({ size = 16, color = '#F5C54D', strokeWidth = 2 }: HomeSvgIconProps) {
  return <ThumbsUpLogoSvg width={size} height={size} color={color} strokeWidth={strokeWidth} />;
}

export function ThumbsDownHomeIcon({ size = 16, color = '#F5C54D', strokeWidth = 2 }: HomeSvgIconProps) {
  return <ThumbsDownLogoSvg width={size} height={size} color={color} strokeWidth={strokeWidth} />;
}
