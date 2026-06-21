import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
interface RepoCardProps {
  label: string;
  isTaller?: boolean;
}
export function RepoCard({ label, isTaller = false }: RepoCardProps) {
  return (
    <Pressable style={({ pressed }) => [
      styles.cardWrapper,
      isTaller ? styles.tallerCard : styles.regularCard,
      pressed && styles.pressedCard
    ]}>
      {/* Background glass overlay */}
      <View style={[styles.glassBackground, styles.borderGlow]} />
      
      {/* Label Text */}
      <Text style={styles.cardLabel}>
        {label}
      </Text>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  cardWrapper: {
    width: '100%',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: 'rgba(11, 15, 12, 0.6)', // Glass-like translucent dark background
    borderWidth: 1,
    borderColor: 'rgba(142, 255, 122, 0.25)', // Soft green border
  },
  tallerCard: {
    height: 180,
  },
  regularCard: {
    height: 120,
  },
  pressedCard: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
    borderColor: '#8EFF7A',
    shadowColor: '#8EFF7A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  glassBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 18, 0.4)', // Overlay for depth
  },
  borderGlow: {
    // Subtle shadow glow mimicking the screenshot
    shadowColor: '#8EFF7A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  cardLabel: {
    fontFamily: 'NataSans-Medium',
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
    zIndex: 1,
  },
});
