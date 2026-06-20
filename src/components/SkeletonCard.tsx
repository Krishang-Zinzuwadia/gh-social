import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

interface SkeletonCardProps {
  height?: number;
}

export default function SkeletonCard({ height = 80 }: SkeletonCardProps): React.JSX.Element {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={{
        height,
        backgroundColor: '#1C1C1E',
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#2C2C2E',
        opacity,
      }}
    />
  );
}