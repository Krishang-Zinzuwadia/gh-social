import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bug, Clock, Eye, GitFork, MessageSquare, Star, ThumbsDown, ThumbsUp } from 'lucide-react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import Svg, { Path } from 'react-native-svg';

import { BottomNav } from '@/components/bottom-nav';
import { RepoCard } from '@/components/repo-card';
import { SavePopup } from '@/components/save-popup';

type ScreenMode = 'home' | 'details';

// ─── Card definitions ────────────────────────────────────────────────────────
const HOME_CARDS = [
  { label: 'Description',    height: 175 },
  { label: 'Tech Stack',     height: 160 },
  { label: 'README Summary', height: 140 },
];

const DETAIL_CARDS = [
  { label: 'ARCHITECTURE', height: 190 },
  { label: 'CODE SNIPPET',  height: 130 },
  { label: 'ISSUES',        height: 160 },
];

const REACTIONS = [
  { id: 'like',    Icon: ThumbsUp,      count: '1k',  color: '#F5C54D' },
  { id: 'dislike', Icon: ThumbsDown,    count: '200', color: '#F5C54D' },
  { id: 'fork',    Icon: GitFork,       count: '2k',  color: '#6DA963' },
  { id: 'comment', Icon: MessageSquare, count: '400', color: '#6DA963' },
];

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const [activeTab, setActiveTab] = useState<'home' | 'discover' | 'profile'>('home');
  const [mode, setMode] = useState<ScreenMode>('home');
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const translateX = useSharedValue(0);
  const pageWidth = Math.min(width, 400);

  useEffect(() => {
    translateX.value =
      mode === 'details'
        ? withTiming(-pageWidth, { duration: 280 })
        : withTiming(0, { duration: 280 });
  }, [mode, pageWidth, translateX]);

  const screensStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const openSaveSheet = () => setIsPopupVisible(true);
  const openDetails   = () => setMode('details');
  const openHome      = () => setMode('home');

  const swipeGesture = Gesture.Pan()
    .activeOffsetX([-18, 18])
    .failOffsetY([-16, 16])
    .onEnd((event) => {
      const isStrongSwipe =
        Math.abs(event.translationX) > 50 || Math.abs(event.velocityX) > 400;
      if (!isStrongSwipe) return;

      if (event.translationX > 0) {
        if (mode === 'home')    runOnJS(openSaveSheet)();
        else if (mode === 'details') runOnJS(openHome)();
      }
      if (event.translationX < 0) {
        if (mode === 'home') runOnJS(openDetails)();
      }
    });

  return (
    <View style={styles.outer}>
      <View style={[styles.device, { maxWidth: pageWidth }]}>
        <GestureDetector gesture={swipeGesture}>
          <Animated.View style={[styles.screens, { width: pageWidth * 2 }, screensStyle]}>
            <RepositoryScreen type="home"    pageWidth={pageWidth} />
            <RepositoryScreen type="details" pageWidth={pageWidth} />
          </Animated.View>
        </GestureDetector>
        <BottomNav activeTab={activeTab} onTabPress={setActiveTab} />
        <SavePopup isVisible={isPopupVisible} onClose={() => setIsPopupVisible(false)} />
      </View>
    </View>
  );
}

// ─── Per-screen component ────────────────────────────────────────────────────
function RepositoryScreen({ type, pageWidth }: { type: ScreenMode; pageWidth: number }) {
  const isDetails = type === 'details';
  const cards     = isDetails ? DETAIL_CARDS : HOME_CARDS;
  const variant   = isDetails ? 'section' : 'center';

  const HEADER_HEIGHT = 56;
  const CARD_GAP = 24;

  const H1 = cards[0].height;
  const H2 = cards[1].height;
  const H3 = cards[2].height;

  // Timeline node coordinates (vertical centers)
  const y0 = HEADER_HEIGHT / 2;
  const y1 = HEADER_HEIGHT + H1 / 2;
  const y2 = HEADER_HEIGHT + H1 + CARD_GAP + H2 / 2;

  // Bottom coordinates of Card 2 and Card 3
  const y2_bottom = HEADER_HEIGHT + H1 + CARD_GAP + H2;
  const y3_bottom = HEADER_HEIGHT + H1 + CARD_GAP + H2 + CARD_GAP + H3;

  // Action column coordinates (curves and dotted line range)
  const y_dotted_start = y2_bottom - 8;
  const y_dotted_end   = y3_bottom - 16;

  const actionPositions = [
    y_dotted_start,
    y_dotted_start + (y_dotted_end - y_dotted_start) * 0.333,
    y_dotted_start + (y_dotted_end - y_dotted_start) * 0.666,
    y_dotted_end,
  ];

  return (
    <ScrollView
      style={[styles.screen, { width: pageWidth }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior="automatic"
    >
      <SafeAreaView edges={['top', 'left', 'right']} style={{ width: '100%' }}>
        <View style={styles.gridContainer}>
          {/* Column 1: Timeline */}
          <View style={styles.timelineCol}>
            {/* Vertical solid line from header dot to Node 2 */}
            <View style={[styles.timelineSpine, { top: y0, height: y2 - y0 }]} />

            {/* Header Node */}
            <View style={[styles.timelineDot, { top: y0 - 6 }]} />

            {/* Node 1 & Arm */}
            <View style={[styles.timelineDot, { top: y1 - 6 }]} />
            <View style={[styles.timelineArm, { top: y1 - 0.75 }]} />

            {/* Node 2 & Arm */}
            <View style={[styles.timelineDot, { top: y2 - 6 }]} />
            <View style={[styles.timelineArm, { top: y2 - 0.75 }]} />

            {/* Timeline Bottom Curve (connecting from Node 2 down and into bottom-left of Card 3) */}
            <Svg
              style={{ position: 'absolute', top: y2, left: 0 }}
              width={44}
              height={y3_bottom - y2}
              viewBox={`0 0 44 ${y3_bottom - y2}`}
              fill="none"
            >
              <Path
                d={`M 22 0 L 22 ${y3_bottom - y2 - 22} Q 22 ${y3_bottom - y2} 44 ${y3_bottom - y2}`}
                stroke="#6DA963"
                strokeWidth={1.5}
              />
            </Svg>
          </View>

          {/* Column 2: Cards */}
          <View style={styles.cardsCol}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Github_Social</Text>
            </View>

            {/* Card 1 */}
            <RepoCard label={cards[0].label} height={H1} variant={variant} />

            <View style={{ height: CARD_GAP }} />

            {/* Card 2 */}
            <RepoCard label={cards[1].label} height={H2} variant={variant} />

            <View style={{ height: CARD_GAP }} />

            {/* Card 3 */}
            <RepoCard label={cards[2].label} height={H3} variant={variant} />

            {/* Footer */}
            <UserFooter />
          </View>

          {/* Column 3: Actions */}
          <View style={styles.actionsCol}>
            {/* Card 2 Bottom-Right Top Curve (curves down into dotted line) */}
            <Svg
              style={{ position: 'absolute', top: y2_bottom - 24, left: 0 }}
              width={16}
              height={16}
              viewBox="0 0 16 16"
              fill="none"
            >
              <Path
                d="M 0 0.75 Q 16 0.75 16 16"
                stroke="#6DA963"
                strokeWidth={1.5}
              />
            </Svg>

            {/* Card 3 Bottom-Right Bottom Curve (curves left from dotted line into Card 3 bottom-right) */}
            <Svg
              style={{ position: 'absolute', top: y3_bottom - 16, left: 0 }}
              width={16}
              height={16}
              viewBox="0 0 16 16"
              fill="none"
            >
              <Path
                d="M 16 0 Q 16 15.25 0 15.25"
                stroke="#6DA963"
                strokeWidth={1.5}
              />
            </Svg>

            {/* Dotted vertical line in between curves */}
            <View style={[styles.actionDottedLine, { top: y_dotted_start, height: y_dotted_end - y_dotted_start }]} />

            {/* Action Buttons */}
            {REACTIONS.map(({ id, Icon, count, color }, index) => {
              const y_pos = actionPositions[index];
              return (
                <View key={id} style={[styles.actionItemContainer, { top: y_pos - 24 }]}>
                  {/* Small intersection dot on the line */}
                  <View style={styles.actionArmDot} />
                  
                  {/* Arm connecting dot to button */}
                  <View style={styles.actionBtnArm} />

                  {/* Pressable button */}
                  <Pressable
                    style={({ pressed }) => [
                      styles.reactionBtn,
                      pressed && styles.reactionBtnPressed,
                    ]}
                  >
                    <Icon size={16} color={color} strokeWidth={2} />
                    <Text style={styles.reactionCount}>{count}</Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
        </View>
      </SafeAreaView>
    </ScrollView>
  );
}

// ─── Footer ──────────────────────────────────────────────────────────────────
function UserFooter() {
  return (
    <View style={styles.footer}>
      <View style={styles.avatar} />
      <View style={styles.userMeta}>
        <Text style={styles.username}>acm_vit</Text>
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Star size={15} color="#6DA963" strokeWidth={1.8} />
            <Text style={styles.statText}>1.2k</Text>
          </View>
          <View style={styles.statItem}>
            <Eye size={15} color="#6DA963" strokeWidth={1.8} />
            <Text style={styles.statText}>5k</Text>
          </View>
          <View style={styles.statItem}>
            <Bug size={14} color="#6DA963" strokeWidth={2} />
            <Text style={styles.statText}>12</Text>
          </View>
        </View>
        <View style={styles.dateRow}>
          <Clock size={14} color="#A49898" strokeWidth={1.6} />
          <Text style={styles.dateText}>updated 2 days ago</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Shell
  outer: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#090B08',
  },
  device: {
    flex: 1,
    width: '100%',
    backgroundColor: '#10150F',
    overflow: 'hidden',
    position: 'relative',
  },
  screens: {
    flex: 1,
    flexDirection: 'row',
  },
  screen: {
    flex: 1,
    backgroundColor: '#10150F',
  },
  scrollContent: {
    paddingBottom: 90,
  },
  title: {
    color: '#FFFFFF',
    fontFamily: 'NataSans-Bold',
    fontSize: 17,
    lineHeight: 22,
  },

  // ── Grid Layout ────────────────────────────────────────────────────────────
  gridContainer: {
    width: '100%',
    flexDirection: 'row',
    position: 'relative',
  },
  timelineCol: {
    width: 44,
    position: 'relative',
  },
  cardsCol: {
    flex: 1,
  },
  actionsCol: {
    width: 72,
    position: 'relative',
  },

  header: {
    height: 56,
    justifyContent: 'center',
  },

  // ── Timeline Column styles ─────────────────────────────────────────────────
  timelineSpine: {
    position: 'absolute',
    left: 22 - 0.75, // Centered horizontally in the 44px timelineCol
    width: 1.5,
    backgroundColor: '#6DA963',
    zIndex: 0,
  },
  timelineDot: {
    position: 'absolute',
    left: 22 - 6, // Centered horizontally
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#6DA963',
    backgroundColor: '#FFFFFF',
    zIndex: 10,
  },
  timelineArm: {
    position: 'absolute',
    left: 22,
    right: 0, // Extends to the right edge of timelineCol
    height: 1.5,
    backgroundColor: '#6DA963',
    zIndex: 10,
  },

  // ── Action Column styles ───────────────────────────────────────────────────
  actionDottedLine: {
    position: 'absolute',
    left: 16 - 0.75, // Positioned at x = 16
    width: 1.5,
    borderLeftWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#6DA963',
    zIndex: 0,
  },
  actionCardArm: {
    position: 'absolute',
    left: 0,
    width: 16,
    height: 1.5,
    backgroundColor: '#6DA963',
    zIndex: 10,
  },
  actionItemContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 48,
    zIndex: 10,
  },
  actionArmDot: {
    position: 'absolute',
    left: 16 - 4, // Centered horizontally on dotted line
    top: 24 - 4,  // Centered vertically in 48px item container
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6DA963',
  },
  actionBtnArm: {
    position: 'absolute',
    left: 16,
    width: 6, // From x = 16 to x = 22
    top: 24 - 0.75,
    height: 1.5,
    backgroundColor: '#6DA963',
    zIndex: 10,
  },
  reactionBtn: {
    position: 'absolute',
    left: 22,
    top: 0,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1E241E',
    borderWidth: 1.5,
    borderColor: '#6DA963',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  reactionBtnPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  reactionCount: {
    color: '#FFFFFF',
    fontSize: 9,
    fontFamily: 'NataSans-Bold',
    marginTop: 1,
    textAlign: 'center',
  },

  // ── Footer ─────────────────────────────────────────────────────────────────
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 0,
    marginTop: 24,
    paddingBottom: 8,
    width: '100%',
  },
  avatar: {
    width: 41,
    height: 41,
    borderRadius: 21,
    backgroundColor: '#6DA963',
    marginRight: 14,
  },
  userMeta: {
    flex: 1,
  },
  username: {
    color: '#FFFFFF',
    fontFamily: 'NataSans-Bold',
    fontSize: 16,
    lineHeight: 21,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 17,
    marginTop: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  statText: {
    color: '#FFFFFF',
    fontFamily: 'NataSans-Regular',
    fontSize: 12,
    lineHeight: 16,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 8,
  },
  dateText: {
    color: '#A49898',
    fontFamily: 'NataSans-Regular',
    fontSize: 10,
    lineHeight: 14,
  },
});
