import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { RepositoryData } from '../../data/repositories';
import { TimelineColumn } from './TimelineColumn';
import DescriptionCard from './DescriptionCard';
import ReadmeCard from './ReadmeCard';
import { HomeUserFooter } from './UserFooter';
import { ThumbsUpHomeIcon, ThumbsDownHomeIcon } from './FeedIcons';

function clampNumber(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

export function RepositoryScreen({
  pageWidth,
  pageHeight,
  repository,
  onReadFullPress,
}: {
  pageWidth: number;
  pageHeight: number;
  repository: RepositoryData;
  onReadFullPress?: () => void;
}) {
  const insets = useSafeAreaInsets();
  const isSmallPhone = pageWidth < 380;

  const TIMELINE_COL_WIDTH = isSmallPhone ? 32 : 38;
  const TIMELINE_MID = TIMELINE_COL_WIDTH / 2;
  const ACTIONS_COL_WIDTH = isSmallPhone ? 44 : 50;

  // ── Dynamic Heights & Gaps ──────────────────────────────────────────────────
  const HEADER_H = 56;
  const CARD_GAP = 8;
  const FOOTER_MIN_H = isSmallPhone ? 110 : 100;
  const VERTICAL_PADDING = 24;

  const availableCardHeight = pageHeight - insets.top - HEADER_H - FOOTER_MIN_H - (CARD_GAP * 2) - VERTICAL_PADDING;
  const totalCardHeight = Math.max(availableCardHeight, 200);

  const HOME_CARD_GAP = isSmallPhone ? 28 : 34;
  const HOME_BRANCH_GAP = isSmallPhone ? 4 : 6;
  const HOME_FOOTER_GAP = isSmallPhone ? 24 : 34;
  const HOME_BOTTOM_PADDING = isSmallPhone ? 18 : 22;
  const HOME_FOOTER_HEIGHT = isSmallPhone ? 44 : 52;
  
  // Expand card height allowances to accommodate padding/larger text size
  const HOME_BASE_DESCRIPTION_HEIGHT = isSmallPhone ? 246 : 288;
  const HOME_BASE_README_HEIGHT = isSmallPhone ? 200 : 236;
  
  const homeBaseContentHeight =
    HEADER_H +
    HOME_BASE_DESCRIPTION_HEIGHT +
    HOME_CARD_GAP +
    HOME_BASE_README_HEIGHT +
    HOME_FOOTER_GAP +
    HOME_FOOTER_HEIGHT +
    HOME_BOTTOM_PADDING;
  const homeExtraHeight = clampNumber(
    pageHeight - insets.top - homeBaseContentHeight,
    0,
    isSmallPhone ? 44 : 86
  );
  const H1 = HOME_BASE_DESCRIPTION_HEIGHT + homeExtraHeight * 0.48;
  const H2 = HOME_BASE_README_HEIGHT + homeExtraHeight * 0.52;
  const contentHeight =
    HEADER_H +
    H1 +
    HOME_CARD_GAP +
    H2 +
    HOME_FOOTER_GAP +
    HOME_FOOTER_HEIGHT +
    HOME_BOTTOM_PADDING;
  const centeredTopPadding = clampNumber((pageHeight - insets.top - contentHeight) / 2, 8, 22);

  const y0 = HEADER_H / 2;
  const y1 = HEADER_H + 25;
  const y2 = HEADER_H + H1 + HOME_CARD_GAP + 25;
  const y3_bottom = HEADER_H + H1 + HOME_CARD_GAP + H2;

  const y2_top = HEADER_H + H1 + HOME_CARD_GAP;
  const y2_bottom = y3_bottom;

  const loop_start = y2_top + 28;
  const loop_end = y2_bottom - 28;
  const loop_x = 26;
  const radius = 10;

  const timelinePath = `
    M ${TIMELINE_MID} ${y0} L ${TIMELINE_MID} ${y3_bottom - 12}
    M ${TIMELINE_MID} ${y1 - 12} Q ${TIMELINE_MID} ${y1} ${TIMELINE_MID + 12} ${y1} L ${TIMELINE_COL_WIDTH + 2} ${y1}
    M ${TIMELINE_MID} ${y2 - 12} Q ${TIMELINE_MID} ${y2} ${TIMELINE_MID + 12} ${y2} L ${TIMELINE_COL_WIDTH + 2} ${y2}
    M ${TIMELINE_MID} ${y3_bottom - 12} Q ${TIMELINE_MID} ${y3_bottom} ${TIMELINE_COL_WIDTH + 2} ${y3_bottom}
  `;

  const bracketPath = `
    M -2 ${loop_start}
    L ${loop_x - radius} ${loop_start}
    Q ${loop_x} ${loop_start} ${loop_x} ${loop_start + radius}
    L ${loop_x} ${loop_end - radius}
    Q ${loop_x} ${loop_end} ${loop_x - radius} ${loop_end}
    L -2 ${loop_end}
  `;

  const btnY1 = loop_start + (loop_end - loop_start) * 0.28;
  const btnY2 = loop_start + (loop_end - loop_start) * 0.68;

  const ACTION_BTN_SIZE = 34;

  return (
    <View style={[styles.screen, { width: pageWidth, height: pageHeight }]}>
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.screenInner}>
        <ScrollView
          contentContainerStyle={[
            styles.homeScrollContent,
            { paddingTop: centeredTopPadding, minHeight: pageHeight },
          ]}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.homeGridContainer}>
            {/* Column 1: Timeline */}
            <View style={[styles.timelineCol, { width: TIMELINE_COL_WIDTH }]}>
              <TimelineColumn
                pageHeight={pageHeight}
                TIMELINE_COL_WIDTH={TIMELINE_COL_WIDTH}
                TIMELINE_MID={TIMELINE_MID}
                timelinePath={timelinePath}
                y0={y0}
                y1={y1}
                y2={y2}
              />
            </View>

            {/* Column 2: Cards */}
            <View style={styles.cardsCol}>
              {/* Header */}
              <View style={[styles.header, { height: HEADER_H }]}>
                <Text style={[styles.title, styles.homeTitle, isSmallPhone && { fontSize: 22, lineHeight: 28 }]}>
                  {repository.title}
                </Text>
              </View>

              {/* Description Card */}
              <DescriptionCard repository={repository} height={H1} isSmallPhone={isSmallPhone} />

              <View style={{ height: HOME_CARD_GAP }} />

              {/* Readme Card */}
              <ReadmeCard
                repository={repository}
                height={H2}
                onReadFullPress={onReadFullPress!}
              />

              {/* Footer */}
              <HomeUserFooter
                repository={repository}
                isSmallPhone={isSmallPhone}
                topGap={HOME_FOOTER_GAP}
              />
            </View>

            {/* Column 3: Actions */}
            <View style={[styles.actionsCol, { width: ACTIONS_COL_WIDTH }]}>
              <Svg style={StyleSheet.absoluteFill} width={ACTIONS_COL_WIDTH} height={pageHeight}>
                <Path d={bracketPath} stroke="#8EFF7A" strokeWidth={1.5} fill="none" />
              </Svg>

              {/* Thumbs Up Button */}
              <TouchableOpacity
                activeOpacity={0.7}
                style={[
                  styles.loopReactionBtn,
                  {
                    left: loop_x - ACTION_BTN_SIZE / 2,
                    top: btnY1 - ACTION_BTN_SIZE / 2,
                    width: ACTION_BTN_SIZE,
                    height: ACTION_BTN_SIZE,
                    borderRadius: ACTION_BTN_SIZE / 2,
                  }
                ]}
              >
                <ThumbsUpHomeIcon size={14} color="#F5C54D" strokeWidth={2} />
                <Text style={styles.loopReactionCount}>1k</Text>
              </TouchableOpacity>

              {/* Thumbs Down Button */}
              <TouchableOpacity
                activeOpacity={0.7}
                style={[
                  styles.loopReactionBtn,
                  {
                    left: loop_x - ACTION_BTN_SIZE / 2,
                    top: btnY2 - ACTION_BTN_SIZE / 2,
                    width: ACTION_BTN_SIZE,
                    height: ACTION_BTN_SIZE,
                    borderRadius: ACTION_BTN_SIZE / 2,
                  }
                ]}
              >
                <ThumbsDownHomeIcon size={14} color="#F5C54D" strokeWidth={2} />
                <Text style={styles.loopReactionCount}>200</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: '#0D100D',
  },
  screenInner: {
    flex: 1,
    width: '100%',
  },
  title: {
    color: '#FFFFFF',
    fontFamily: 'NataSans-Bold',
    fontSize: 24,
    lineHeight: 30,
  },
  homeTitle: {
    marginLeft: -10,
  },
  homeGridContainer: {
    width: '100%',
    flexDirection: 'row',
    position: 'relative',
    alignSelf: 'center',
    paddingLeft: 4,
    paddingRight: 8,
  },
  homeScrollContent: {
    flexGrow: 1,
    paddingBottom: 10,
  },
  timelineCol: {
    width: 44,
    position: 'relative',
  },
  cardsCol: {
    flex: 1,
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  actionsCol: {
    position: 'relative',
  },
  loopReactionBtn: {
    position: 'absolute',
    backgroundColor: '#10150F',
    borderWidth: 1.5,
    borderColor: '#8EFF7A',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 30,
    paddingVertical: 4,
  },
  loopReactionCount: {
    color: '#FFFFFF',
    fontSize: 8,
    fontFamily: 'NataSans-Bold',
    marginTop: 2,
    textAlign: 'center',
  },
});
