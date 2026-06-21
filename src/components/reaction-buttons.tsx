import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { ThumbsUp, ThumbsDown, GitFork, MessageSquare } from 'lucide-react-native';
export function ReactionButtons() {
  const reactions = [
    { id: 'like', Icon: ThumbsUp, count: '1k', color: '#FFB23F' },
    { id: 'dislike', Icon: ThumbsDown, count: '200', color: '#FFB23F' },
    { id: 'fork', Icon: GitFork, count: '2k', color: '#8EFF7A' },
    { id: 'comment', Icon: MessageSquare, count: '400', color: '#8EFF7A' },
  ];
  return (
    <View style={styles.container}>
      {/* Dashed connector line track on the left */}
      <View style={styles.dashedTrack}>
        {/* Horizontal branch lines for each button */}
        {reactions.map((_, index) => (
          <View 
            key={index} 
            style={[
              styles.branchLine, 
              { top: index * 68 + 24 } // Align with the center of each button
            ]} 
          />
        ))}
      </View>
      {/* Vertical buttons list */}
      <View style={styles.buttonsList}>
        {reactions.map(({ id, Icon, count, color }) => (
          <View key={id} style={styles.buttonWrapper}>
            <Pressable 
              style={({ pressed }) => [
                styles.buttonOuter,
                pressed && styles.buttonPressed,
                { borderColor: color === '#8EFF7A' ? 'rgba(142, 255, 122, 0.35)' : 'rgba(255, 178, 63, 0.35)' }
              ]}
            >
              <Icon 
                size={16} 
                strokeWidth={2} 
                color={color} 
                style={color === '#8EFF7A' ? styles.glowGreen : styles.glowOrange} 
              />
            </Pressable>
            <Text style={styles.countText}>{count}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'stretch',
    position: 'relative',
    paddingLeft: 16,
  },
  dashedTrack: {
    position: 'absolute',
    left: 0,
    top: 24,
    bottom: 24 + 12,
    width: 16,
    borderLeftWidth: 1,
    borderColor: 'rgba(142, 255, 122, 0.4)',
    borderStyle: 'dashed',
  },
  branchLine: {
    position: 'absolute',
    left: 0,
    width: 16,
    height: 1,
    borderTopWidth: 1,
    borderColor: 'rgba(142, 255, 122, 0.4)',
    borderStyle: 'dashed',
  },
  buttonsList: {
    flexDirection: 'column',
    gap: 20,
  },
  buttonWrapper: {
    alignItems: 'center',
    width: 48,
  },
  buttonOuter: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0B0F0C',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8EFF7A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  buttonPressed: {
    transform: [{ scale: 0.95 }],
    opacity: 0.8,
  },
  countText: {
    fontFamily: 'NataSans-Regular',
    fontSize: 10,
    color: '#808581',
    marginTop: 4,
    textAlign: 'center',
  },
  glowGreen: {
    shadowColor: '#8EFF7A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  glowOrange: {
    shadowColor: '#FFB23F',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
});