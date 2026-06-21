import React from 'react';
import { View, StyleSheet } from 'react-native';
export function HeaderTimeline() {
  return (
    <View style={styles.timelineContainer}>
      {/* Top glowing status dot */}
      <View style={[styles.statusDot, styles.glowPrimary]} />
      {/* Line segment from dot to bottom */}
      <View style={[styles.verticalLine, { top: 16, bottom: 0 }]} />
    </View>
  );
}
interface CardTimelineProps {
  isLast?: boolean;
}
export function CardTimeline({ isLast = false }: CardTimelineProps) {
  if (isLast) {
    return (
      <View style={styles.timelineContainer}>
        {/* Vertical line from top to center-left curve */}
        <View style={[styles.verticalLine, { top: 0, height: '50%' }]} />
        {/* Curved corner segment */}
        <View style={styles.curvedSegment} />
      </View>
    );
  }
  return (
    <View style={styles.timelineContainer}>
      {/* Full vertical line */}
      <View style={[styles.verticalLine, { top: 0, bottom: 0 }]} />
      
      {/* Circular node with white center */}
      <View style={styles.nodeWrapper}>
        <View style={styles.nodeOuter}>
          <View style={styles.nodeInner} />
        </View>
      </View>
      {/* Horizontal connector to the card */}
      <View style={styles.horizontalConnector} />
    </View>
  );
}
const styles = StyleSheet.create({
  timelineContainer: {
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    height: '100%',
  },
  statusDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#8EFF7A',
    borderWidth: 2,
    borderColor: '#ffffff',
    zIndex: 10,
    top: 6,
    position: 'absolute',
  },
  verticalLine: {
    position: 'absolute',
    width: 2,
    backgroundColor: '#8EFF7A',
    shadowColor: '#8EFF7A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    left: '50%',
    marginLeft: -1,
  },
  nodeWrapper: {
    position: 'absolute',
    top: '50%',
    marginTop: -8,
    zIndex: 10,
  },
  nodeOuter: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#0B0F0C',
    borderWidth: 2,
    borderColor: '#8EFF7A',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8EFF7A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
  },
  nodeInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ffffff',
  },
  horizontalConnector: {
    position: 'absolute',
    left: '50%',
    right: 0,
    height: 2,
    backgroundColor: '#8EFF7A',
    top: '50%',
    marginTop: -1,
    shadowColor: '#8EFF7A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  curvedSegment: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    right: 0,
    height: '50%',
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#8EFF7A',
    borderBottomLeftRadius: 16,
    marginLeft: -1,
    marginTop: -1,
    shadowColor: '#8EFF7A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  glowPrimary: {
    shadowColor: '#8EFF7A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
  },
});