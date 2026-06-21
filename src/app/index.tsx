import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Dimensions, 
  Platform,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Star, Eye, Award, Clock } from 'lucide-react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
// Custom Components
import { HeaderTimeline, CardTimeline } from '@/components/timeline';
import { RepoCard } from '@/components/repo-card';
import { ReactionButtons } from '@/components/reaction-buttons';
import { FloatingActions } from '@/components/floating-actions';
import { SavePopup } from '@/components/save-popup';
import { BottomNav } from '@/components/bottom-nav';
const { width: SCREEN_WIDTH } = Dimensions.get('window');
export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState<'home' | 'discover' | 'profile'>('home');
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  // Swipe gesture configuration: swiping right opens popup
  const swipeGesture = Gesture.Pan()
    .activeOffsetX(10) // trigger gesture after dragging horizontally by 10px
    .onEnd((event) => {
      // Swipe right detected (positive translationX and velocity)
      if (event.translationX > 50 && event.velocityX > 150) {
        runOnJS(setIsPopupVisible)(true);
      }
    });
    console.log({
    HeaderTimeline,
    CardTimeline,
    RepoCard,
    ReactionButtons,
    FloatingActions,
    SavePopup,
    BottomNav,
    SafeAreaView,
    GestureDetector,
  });
  return (
    <View style={styles.container}>
      {/* Desktop/Tablet Responsive Container Frame */}
      <View style={styles.appContainer}>
        
        {/* Main Content Area wrapped with GestureDetector */}
        <GestureDetector gesture={swipeGesture}>
          <ScrollView 
            style={styles.scrollContainer}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
              
              {/* Header Section */}
              <View style={styles.headerRow}>
                <View style={styles.headerTimelineWrapper}>
                  <HeaderTimeline />
                </View>
                <Text style={styles.headerTitle}>Github_Social</Text>
              </View>
              {/* Stacked Cards and Timeline Layout */}
              <View style={styles.contentBody}>
                {/* Timeline Column */}
                <View style={styles.timelineColumn}>
                  <View style={styles.timelineSegmentTaller}>
                    <CardTimeline isLast={false} />
                  </View>
                  <View style={styles.timelineSegmentRegular}>
                    <CardTimeline isLast={false} />
                  </View>
                  <View style={styles.timelineSegmentRegular}>
                    <CardTimeline isLast={true} />
                  </View>
                </View>
                {/* Cards and Actions Column */}
                <View style={styles.cardsColumn}>
                  <View style={styles.cardSpacingTaller}>
                    <RepoCard label="Code Snippet/" isTaller={true} />
                  </View>
                  
                  <View style={styles.cardSpacingRegular}>
                    <RepoCard label="Important Sections" isTaller={false} />
                  </View>
                  <View style={styles.cardSpacingRegular}>
                    <RepoCard label="Description" isTaller={false} />
                  </View>
                  {/* Absolute Positioned Reaction Buttons on the right side of Card 2 and Card 3 */}
                  <View style={styles.reactionButtonsPositioner}>
                    <ReactionButtons />
                  </View>
                </View>
              </View>
              {/* Repository Footer Metadata Section */}
              <View style={styles.footerSection}>
                {/* Left side Timeline padding (to align with the timeline column above) */}
                <View style={{ width: 48 }} />
                {/* Metadata content */}
                <View style={styles.footerContent}>
                  {/* User Profile Info */}
                  <View style={styles.userInfoRow}>
                    <View style={styles.avatar} />
                    <Text style={styles.username}>acm_vit</Text>
                  </View>
                  {/* Stats Row */}
                  <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                      <Star size={14} strokeWidth={2} color="#8EFF7A" style={styles.statIcon} />
                      <Text style={styles.statText}>1.2k</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Eye size={14} strokeWidth={2} color="#8EFF7A" style={styles.statIcon} />
                      <Text style={styles.statText}>5k</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Award size={14} strokeWidth={2} color="#8EFF7A" style={styles.statIcon} />
                      <Text style={styles.statText}>12</Text>
                    </View>
                  </View>
                  {/* Date/Time Row */}
                  <View style={styles.dateRow}>
                    <Clock size={12} color="#808581" style={styles.dateIcon} />
                    <Text style={styles.dateText}>updated 2 days ago</Text>
                  </View>
                </View>
              </View>
            </SafeAreaView>
          </ScrollView>
        </GestureDetector>
        {/* Floating Action Buttons */}
        <FloatingActions />
        {/* Fixed Bottom Navigation */}
        <BottomNav activeTab={activeTab} onTabPress={setActiveTab} />
        {/* Save Repository Popup modal sheet */}
        <SavePopup isVisible={isPopupVisible} onClose={() => setIsPopupVisible(false)} />
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#030504', // Deepest black background of outer screen
    justifyContent: 'center',
    alignItems: 'center',
  },
  appContainer: {
    flex: 1,
    width: '100%',
    maxWidth: 480, // Mobile device frame constraint on desktop/tablet
    height: '100%',
    backgroundColor: '#0B0F0C', // Deep near-black background matching design
    position: 'relative',
    overflow: 'hidden',
    borderLeftWidth: Platform.OS === 'web' ? 1 : 0,
    borderRightWidth: Platform.OS === 'web' ? 1 : 0,
    borderColor: 'rgba(142, 255, 122, 0.1)', // Subtle vertical boundaries on desktop
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 110, // Safe clearance for bottom navigation and floating button
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    height: 48,
  },
  headerTimelineWrapper: {
    width: 48,
    alignItems: 'center',
    height: '100%',
  },
  headerTitle: {
    fontFamily: 'NataSans-Medium',
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.85)',
    marginLeft: 4,
  },
  contentBody: {
    flexDirection: 'row',
    alignItems: 'stretch',
    position: 'relative',
  },
  timelineColumn: {
    width: 48,
    alignItems: 'center',
  },
  timelineSegmentTaller: {
    height: 196, // Matches taller card height (180) + padding spacing (16)
  },
  timelineSegmentRegular: {
    height: 136, // Matches regular card height (120) + padding spacing (16)
  },
  cardsColumn: {
    flex: 1,
    paddingRight: 64, // Leaves space on the right for absolute positioned reaction buttons
  },
  cardSpacingTaller: {
    height: 180,
    marginBottom: 16,
  },
  cardSpacingRegular: {
    height: 120,
    marginBottom: 16,
  },
  reactionButtonsPositioner: {
    position: 'absolute',
    right: 0,
    top: 180 + 16 + 12, // Align starting next to Card 2
    width: 64,
  },
  footerSection: {
    flexDirection: 'row',
    marginTop: 8,
    marginBottom: 24,
  },
  footerContent: {
    flex: 1,
    paddingLeft: 12,
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#66D95B', // Accent Green circular avatar
    marginRight: 14,
    shadowColor: '#8EFF7A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  username: {
    fontFamily: 'NataSans-SemiBold',
    fontSize: 16,
    color: '#ffffff',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    marginRight: 6,
  },
  statText: {
    fontFamily: 'NataSans-Medium',
    fontSize: 13,
    color: '#ffffff',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateIcon: {
    marginRight: 6,
  },
  dateText: {
    fontFamily: 'NataSans-Regular',
    fontSize: 11,
    color: '#808581',
  },
});