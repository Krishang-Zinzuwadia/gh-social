import { useCallback, useEffect, useState } from 'react';
import { FlatList, Platform, StyleSheet, useWindowDimensions, View, type ViewStyle } from 'react-native';
import { getResponsiveContentWidth } from '@/components/responsive-layout';
import { REPOSITORIES } from '@/data/repositories';
import { RepositoryFeedItem } from '@/components/home/RepositoryFeedItem';

type RepositoryData = {
  id: string;
  title: string;
  owner: string;
  description: string;
  readmeSummary: string;
  readmeFull: string;
  stats: {
    stars: string;
    views: string;
    bugs: string;
    forks: string;
  };
  updatedText: string;
};

type FeedRepository = {
  feedId: string;
  repository: RepositoryData;
};

type ViewabilityItem = {
  index?: number | null;
};

const TAB_BAR_HEIGHT = 60;
const WEB_FEED_LIST_STYLE =
  Platform.OS === 'web'
    ? ({ overflowY: 'auto', scrollSnapType: 'y mandatory' } as ViewStyle)
    : null;

const VIEWABILITY_CONFIG = {
  itemVisiblePercentThreshold: 80,
};

export default function HomeScreen() {
  const { width, height } = useWindowDimensions();
  const viewportWidth = getResponsiveContentWidth(width) ?? width;
  const pageWidth = Math.max(Math.min(viewportWidth - 28, 680), 1);
  const pageHeight = Math.max(height - TAB_BAR_HEIGHT - 28, 1);
  const [activeRepositoryIndex, setActiveRepositoryIndex] = useState(0);
  const [feedItems, setFeedItems] = useState<FeedRepository[]>(
    REPOSITORIES.map((repository, index) => ({
      feedId: `${repository.id}-${index}`,
      repository,
    }))
  );

  const activeRepository = feedItems[activeRepositoryIndex]?.repository ?? feedItems[0]?.repository;
  void activeRepository;

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    let startX = 0;
    let startY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const diffX = e.touches[0].clientX - startX;
        const diffY = e.touches[0].clientY - startY;

        // Prevent browser back/forward swipe gesture navigation when dragging horizontally
        if (Math.abs(diffX) > Math.abs(diffY)) {
          if (e.cancelable) {
            e.preventDefault();
          }
        }
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewabilityItem[] }) => {
      const nextIndex = viewableItems.find(
        (item) => typeof item.index === 'number' && item.index !== null
      )?.index;
      if (typeof nextIndex === 'number') {
        setActiveRepositoryIndex(nextIndex);
      }
    },
    []
  );

  const loadMoreRepositories = () => {
    setFeedItems((current) => {
      if (current.length >= 16) return current;

      const nextBatchStart = current.length;
      const nextBatch = REPOSITORIES.map((repository, index) => ({
        feedId: `${repository.id}-${nextBatchStart + index}`,
        repository,
      }));

      return [...current, ...nextBatch];
    });
  };

  return (
    <View style={styles.outer}>
      <View style={[styles.feedShell, { maxWidth: pageWidth, height: pageHeight }]}>
        <FlatList
          key={`${pageWidth}-${pageHeight}`}
          data={feedItems}
          keyExtractor={(item) => item.feedId}
          renderItem={({ item }) => (
            <RepositoryFeedItem
              repository={item.repository}
              pageWidth={pageWidth}
              pageHeight={pageHeight}
            />
          )}
          style={[styles.feedList, { height: pageHeight }, WEB_FEED_LIST_STYLE]}
          contentContainerStyle={styles.feedListContent}
          showsVerticalScrollIndicator={false}
          snapToInterval={pageHeight}
          snapToAlignment="start"
          decelerationRate="fast"
          pagingEnabled
          disableIntervalMomentum
          overScrollMode="never"
          getItemLayout={(_, index) => ({
            length: pageHeight,
            offset: pageHeight * index,
            index,
          })}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={VIEWABILITY_CONFIG}
          onEndReached={loadMoreRepositories}
          onEndReachedThreshold={0.75}
          initialNumToRender={4}
          maxToRenderPerBatch={4}
          removeClippedSubviews={false}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#050806',
  },
  feedShell: {
    width: '100%',
    backgroundColor: '#0D100D',
    overflow: 'hidden',
    position: 'relative',
    marginTop: 14,
    borderRadius: 6,
  },
  feedList: {
    flex: 1,
    width: '100%',
  },
  feedListContent: {
    flexGrow: 0,
  },
});
