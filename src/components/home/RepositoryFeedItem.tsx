import React, { useState, useCallback, useMemo, useRef } from 'react';
import { Animated, Easing, PanResponder, Platform, StyleSheet, View, type ViewStyle, GestureResponderEvent } from 'react-native';
import { RepositoryData } from '../../data/repositories';
import { RepositoryScreen } from './RepositoryScreen';
import { SavePopup } from './save-popup';
import { ReadmePopup } from './ReadmePopup';

function clampNumber(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

const WEB_FEED_ITEM_STYLE =
  Platform.OS === 'web'
    ? ({ scrollSnapAlign: 'start', scrollSnapStop: 'always' } as ViewStyle)
    : null;

export function RepositoryFeedItem({
  repository,
  pageWidth,
  pageHeight,
  isViewable,
  onQueueActivity,
}: {
  repository: RepositoryData;
  pageWidth: number;
  pageHeight: number;
  isViewable?: boolean;
  onQueueActivity?: (event: { repo_id: string; action: 'like' | 'save' | 'skip' | 'dwell'; dwell_seconds?: number }, flushNow?: boolean) => void;
}) {
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [isReadmeVisible, setIsReadmeVisible] = useState(false);
  const panelWidth = Math.min(pageWidth * 0.82, 320);
  const edgeSwipeWidth = 36;
  const drawerTranslateX = useMemo(() => new Animated.Value(-panelWidth), [panelWidth]);
  const drawerOverlayOpacity = useMemo(() => new Animated.Value(0), []);

  const isDraggingRef = useRef(false);
  const visibleStartTime = useRef<number | null>(null);
  const userActionTaken = useRef(false);

  React.useEffect(() => {
    if (isViewable) {
      visibleStartTime.current = Date.now();
      userActionTaken.current = false;
    } else if (visibleStartTime.current !== null) {
      const dwellSeconds = (Date.now() - visibleStartTime.current) / 1000;
      if (!userActionTaken.current && onQueueActivity) {
        onQueueActivity({ repo_id: repository.id, action: 'skip', dwell_seconds: dwellSeconds });
      } else if (userActionTaken.current && onQueueActivity) {
        // Just record dwell time if action was already sent
        onQueueActivity({ repo_id: repository.id, action: 'dwell', dwell_seconds: dwellSeconds });
      }
      visibleStartTime.current = null;
    }
  }, [isViewable, onQueueActivity, repository.id]);

  const openSaveDrawer = useCallback(() => {
    setIsPopupVisible(true);
    Animated.parallel([
      Animated.spring(drawerTranslateX, {
        toValue: 0,
        tension: 85,
        friction: 12,
        useNativeDriver: true,
      }),
      Animated.timing(drawerOverlayOpacity, {
        toValue: 1,
        duration: 160,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [drawerOverlayOpacity, drawerTranslateX]);

  const [isEdgeGestureActive, setIsEdgeGestureActive] = useState(false);

  const closeSaveDrawer = useCallback(() => {
    Animated.parallel([
      Animated.timing(drawerTranslateX, {
        toValue: -panelWidth,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(drawerOverlayOpacity, {
        toValue: 0,
        duration: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        setIsPopupVisible(false);
        setIsEdgeGestureActive(false);
      }
    });
  }, [drawerOverlayOpacity, drawerTranslateX, panelWidth]);

  const [touchActive, setTouchActive] = useState(false);
  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);

  const edgePanResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onStartShouldSetPanResponderCapture: () => true,
        onMoveShouldSetPanResponder: (_, gestureState) =>
          gestureState.dx > 2 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy),
        onMoveShouldSetPanResponderCapture: (_, gestureState) =>
          gestureState.dx > 2 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy),
        onShouldBlockNativeResponder: () => true,
        onPanResponderGrant: () => {
          setIsEdgeGestureActive(true);
          setIsPopupVisible(true);
          drawerTranslateX.stopAnimation();
          drawerOverlayOpacity.stopAnimation();
          drawerTranslateX.setValue(-panelWidth);
          drawerOverlayOpacity.setValue(0);
        },
        onPanResponderMove: (_, gestureState) => {
          if (gestureState.dx <= 0 || Math.abs(gestureState.dx) < Math.abs(gestureState.dy)) return;
          const nextPanelX = clampNumber(-panelWidth + gestureState.dx, -panelWidth, 0);
          const openProgress = (nextPanelX + panelWidth) / panelWidth;
          drawerTranslateX.setValue(nextPanelX);
          drawerOverlayOpacity.setValue(openProgress);
        },
        onPanResponderRelease: (_, gestureState) => {
          setIsEdgeGestureActive(false);
          if (gestureState.dx > panelWidth * 0.4) {
            openSaveDrawer();
          } else {
            closeSaveDrawer();
          }
        },
        onPanResponderTerminate: () => {
          closeSaveDrawer();
        },
      }),
    [drawerTranslateX, drawerOverlayOpacity, panelWidth, openSaveDrawer, closeSaveDrawer]
  );

  const handleTouchStart = (e: GestureResponderEvent) => {
    if (isReadmeVisible || isPopupVisible) return;
    const pageX = e.nativeEvent.pageX ?? e.nativeEvent.touches?.[0]?.pageX ?? 0;
    const pageY = e.nativeEvent.pageY ?? e.nativeEvent.touches?.[0]?.pageY ?? 0;
    touchStartXRef.current = pageX;
    touchStartYRef.current = pageY;
    setTouchActive(true);
    isDraggingRef.current = false;
  };

  const handleTouchMove = (e: GestureResponderEvent) => {
    if (!touchActive) return;
    const pageX = e.nativeEvent.pageX ?? e.nativeEvent.touches?.[0]?.pageX ?? 0;
    const pageY = e.nativeEvent.pageY ?? e.nativeEvent.touches?.[0]?.pageY ?? 0;
    const diffX = pageX - touchStartXRef.current;
    const diffY = pageY - touchStartYRef.current;

    if (Math.abs(diffX) > 12 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX < 0) {
        // Swipe Left: trigger opening the Save Repository bottom sheet
        isDraggingRef.current = true;
      }
    }
  };

  const handleTouchEnd = () => {
    if (!touchActive) return;
    setTouchActive(false);

    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      openSaveDrawer();
    }
  };

  return (
    <View
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      style={[styles.feedItem, { width: pageWidth, height: pageHeight }, WEB_FEED_ITEM_STYLE]}
    >
      <View style={{ width: pageWidth, height: pageHeight }}>
        <RepositoryScreen
          repository={repository}
          pageWidth={pageWidth}
          pageHeight={pageHeight}
          onReadFullPress={() => setIsReadmeVisible(true)}
          onQueueActivity={(e, flushNow) => {
            userActionTaken.current = true;
            onQueueActivity?.(e, flushNow);
          }}
        />
      </View>

      <View
        {...edgePanResponder.panHandlers}
        pointerEvents={isPopupVisible && !isEdgeGestureActive ? 'none' : 'auto'}
        style={[styles.edgeSwipeZone, { width: edgeSwipeWidth }]}
      />

      <SavePopup
        isVisible={isPopupVisible}
        onClose={closeSaveDrawer}
        panelWidth={panelWidth}
        panelTranslateX={drawerTranslateX}
        overlayOpacity={drawerOverlayOpacity}
        isGestureActive={isEdgeGestureActive}
        repoId={repository.id}
        repoName={repository.title}
        onQueueActivity={(e) => {
          userActionTaken.current = true;
          onQueueActivity?.(e);
        }}
      />
      <ReadmePopup
        isVisible={isReadmeVisible}
        onClose={() => setIsReadmeVisible(false)}
        title={`${repository.title} README`}
        readmeText={repository.readmeFull}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  feedItem: {
    backgroundColor: '#0D100D',
  },
  edgeSwipeZone: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 1000,
    elevation: 1000,
    backgroundColor: 'transparent',
  },
});
