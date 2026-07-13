import { useEffect, useState, useRef, useCallback } from 'react';
import { FlatList, Platform, StyleSheet, useWindowDimensions, View, type ViewStyle, ActivityIndicator, Text } from 'react-native';
import { getResponsiveContentWidth } from '@/components/responsive-layout';
import { RepositoryData } from '@/data/repositories';
import { RepositoryFeedItem } from '@/components/home/RepositoryFeedItem';
import { useInfiniteQuery } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';
import { fetchFeed } from '@/api/feed';
import { sendBatchedActivity, type FeedbackAction } from '@/api/activity';

const TAB_BAR_HEIGHT = 60;
const WEB_FEED_LIST_STYLE =
  Platform.OS === 'web'
    ? ({ overflowY: 'auto', scrollSnapType: 'y mandatory' } as ViewStyle)
    : null;

// Helper to map backend ML JSON to the frontend RepositoryData format
function mapBackendToFrontend(backendItem: any): RepositoryData {
  const repoFullName = backendItem.full_name || backendItem.repo_id || backendItem.id || '';
  const [owner = 'unknown', title = 'repo'] = repoFullName.includes('/') ? repoFullName.split('/') : ['unknown', 'repo'];
  return {
    id: backendItem.repo_id || repoFullName || Math.random().toString(),
    title,
    owner,
    description: backendItem.description || '',
    readmeSummary: backendItem.readme_summary || 'No summary available.',
    readmeFull: backendItem.readme_md || backendItem.readme || 'No readme available.',
    stats: {
      stars: (backendItem.star_count ?? 0).toString(),
      views: (backendItem.views_count ?? 0).toString(),
      bugs: (backendItem.open_issues_count ?? backendItem.pr_count ?? 0).toString(),
      forks: (backendItem.fork_count ?? 0).toString(),
      likes: (backendItem.likes_count ?? backendItem.saves_count ?? 0).toString(),
    },
    updatedText: backendItem.updated_at 
      ? `updated ${new Date(backendItem.updated_at).toLocaleDateString()}` 
      : 'updated recently',
    techStack: backendItem.languages || [],
  };
}

export default function HomeScreen() {
  const { width, height } = useWindowDimensions();
  const viewportWidth = getResponsiveContentWidth(width) ?? width;
  const pageWidth = Math.max(Math.min(viewportWidth - 28, 680), 1);
  const pageHeight = Math.max(height - TAB_BAR_HEIGHT - 28, 1);
  
  const pendingActivityBatch = useRef<{ repo_id: string; action: FeedbackAction; dwell_seconds?: number }[]>([]);

  const flushActivityBatch = useCallback(async () => {
    if (pendingActivityBatch.current.length > 0) {
      const token = await SecureStore.getItemAsync('access_token');
      if (token) {
        const events = [...pendingActivityBatch.current];
        pendingActivityBatch.current = [];
        try {
          await sendBatchedActivity(events, token);
        } catch (err: any) {
          const errorMessage = err?.message?.toLowerCase() || '';
          const isAuthError = errorMessage.includes('token') || errorMessage.includes('unauthorized');
          
          if (!isAuthError) {
            // It's likely a network error, put the events back in the queue to retry later
            pendingActivityBatch.current = [...events, ...pendingActivityBatch.current];
            console.log('Network issue: restored batched activity to queue');
          } else {
            console.log('Auth issue: discarding batched activity');
          }
        }
      }
    }
  }, []);

  const fetchFeedPage = async () => {
    const token = await SecureStore.getItemAsync('access_token');
    if (!token) throw new Error('No token');
    
    // Flush batched activity before fetching the next page
    await flushActivityBatch();
    
    return fetchFeed(token);
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['feed'],
    queryFn: fetchFeedPage,
    getNextPageParam: (lastPage) => (lastPage && lastPage.length > 0 ? true : undefined),
    initialPageParam: true,
  });

  const feedItems = data?.pages.flat().map((item, index) => ({
    feedId: `${item.repo_id || index}-${index}`,
    repository: mapBackendToFrontend(item),
  })) || [];

  const handleQueueActivity = useCallback((event: { repo_id: string; action: FeedbackAction; dwell_seconds?: number }, flushNow?: boolean) => {
    pendingActivityBatch.current.push(event);
    
    if (flushNow || pendingActivityBatch.current.length >= 10) {
      flushActivityBatch();
    }
  }, [flushActivityBatch]);

  const [viewableItems, setViewableItems] = useState<string[]>([]);
  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    setViewableItems(viewableItems.map((v: any) => v.item.feedId));
  }).current;
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;

  if (isLoading && feedItems.length === 0) {
    return (
      <View style={[styles.outer, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#8EFF7A" />
      </View>
    );
  }

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
              onQueueActivity={handleQueueActivity}
              isViewable={viewableItems.includes(item.feedId)}
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
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.75}
          initialNumToRender={4}
          maxToRenderPerBatch={4}
          removeClippedSubviews={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
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
