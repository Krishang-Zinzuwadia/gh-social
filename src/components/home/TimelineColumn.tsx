import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

type TimelineColumnProps = {
  pageHeight: number;
  TIMELINE_COL_WIDTH: number;
  TIMELINE_MID: number;
  timelinePath: string;
  y0: number;
  y1: number;
  y2: number;
};

export function TimelineColumn({
  pageHeight,
  TIMELINE_COL_WIDTH,
  TIMELINE_MID,
  timelinePath,
  y0,
  y1,
  y2,
}: TimelineColumnProps) {
  return (
    <View style={styles.timelineCol}>
      <Svg style={StyleSheet.absoluteFill} width={TIMELINE_COL_WIDTH} height={pageHeight}>
        <Path d={timelinePath} stroke="#8EFF7A" strokeWidth={1.5} fill="none" />
        <Circle cx={TIMELINE_MID} cy={y0} r={6} fill="#FFFFFF" stroke="#8EFF7A" strokeWidth={2} />
        <Circle cx={TIMELINE_MID} cy={y1} r={6} fill="#FFFFFF" stroke="#8EFF7A" strokeWidth={2} />
        <Circle cx={TIMELINE_MID} cy={y2} r={6} fill="#FFFFFF" stroke="#8EFF7A" strokeWidth={2} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  timelineCol: {
    flex: 1,
  },
});
