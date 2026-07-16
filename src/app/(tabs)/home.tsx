import { useState, useRef, useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type LayoutChangeEvent,
  type ViewStyle,
} from 'react-native';
import { getResponsiveContentWidth } from '@/components/responsive-layout';
import { REPOSITORIES, RepositoryData } from '@/data/repositories';
import { RepositoryFeedItem } from '@/components/home/RepositoryFeedItem';
import { REFERENCE_THEME } from '@/constants/theme';
import { useInfiniteQuery } from '@tanstack/react-query';
import * as SecureStore from '../../utils/storage';
import { fetchFeed } from '@/api/feed';
import { sendBatchedActivity, type FeedbackAction, type QueuedActivity } from '@/api/activity';
import { useAuth } from '@/store/AuthContext';

const WEB_FEED_LIST_STYLE =
  Platform.OS === 'web'
    ? ({ overflowY: 'auto', scrollSnapType: 'y mandatory' } as ViewStyle)
    : null;
const VIEWABILITY_CONFIG = { itemVisiblePercentThreshold: 50 } as const;

// Helper to map backend ML JSON to the frontend RepositoryData format
function mapBackendToFrontend(backendItem: any): RepositoryData {
  const repoFullName =
    backendItem.full_name ||
    backendItem.github_repo ||
    backendItem.repo_id ||
    backendItem.id ||
    '';
  const [owner = 'unknown', title = 'repo'] = repoFullName.includes('/') ? repoFullName.split('/') : ['unknown', 'repo'];
  const rawLanguages = backendItem.languages ?? backendItem.language_used ?? [];
  const techStack = Array.isArray(rawLanguages)
    ? rawLanguages.map((language) =>
        typeof language === 'string' ? language : language?.name
      ).filter(Boolean)
    : Object.keys(rawLanguages || {});

  return {
    id: backendItem.repo_id || repoFullName || Math.random().toString(),
    serveId: backendItem.serve_id ?? null,
    feedPosition: backendItem.position ?? null,
    title,
    owner,
    description: backendItem.description || '',
    readmeSummary: backendItem.readme_summary || backendItem.summary || 'No summary available.',
    readmeFull: backendItem.readme_md || backendItem.readme || 'No readme available.',
    stats: {
      stars: (backendItem.star_count ?? 0).toString(),
      views: (backendItem.views_count ?? 0).toString(),
      bugs: (backendItem.open_issues_count ?? backendItem.pr_count ?? 0).toString(),
      forks: (backendItem.fork_count ?? 0).toString(),
      likes: (backendItem.likes_count ?? backendItem.saves_count ?? 0).toString(),
      comments: (backendItem.comments_count ?? backendItem.comment_count ?? 0).toString(),
    },
    updatedText: backendItem.updated_at 
      ? `updated ${new Date(backendItem.updated_at).toLocaleDateString()}` 
      : 'updated recently',
    techStack,
  };
}

export default function HomeScreen() {
  const { user } = useAuth();
  const isPreview = user?.isPreview === true;
  const { width, height } = useWindowDimensions();
  const responsiveWidth = getResponsiveContentWidth(width) ?? width;
  const [viewport, setViewport] = useState({
    width: Math.max(Math.min(responsiveWidth, 520), 1),
    height: Math.max(height, 1),
  });
  const pageWidth = viewport.width;
  const pageHeight = viewport.height;
  
  const pendingActivityBatch = useRef<QueuedActivity[]>([]);

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

  const fetchFeedPage = async ({ pageParam }: { pageParam: string | null }) => {
    const token = await SecureStore.getItemAsync('access_token');
    if (!token) throw new Error('No token');
    
    // Flush batched activity before fetching the next page
    await flushActivityBatch();
    
    return fetchFeed(token, pageParam);
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['feed', user?.user_id],
    queryFn: fetchFeedPage,
    enabled: !isPreview,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: null as string | null,
  });

  const feedItems = useMemo(() => isPreview
    ? REPOSITORIES.map((repository, index) => ({
        feedId: `preview-${repository.id}-${index}`,
        repository,
      }))
    : data?.pages.flatMap((page) => page.items).map((item, index) => ({
        feedId: `${item.repo_id || index}-${index}`,
        repository: mapBackendToFrontend(item),
      })) || [], [data?.pages, isPreview]);

  const handleQueueActivity = useCallback((event: { repo_id: string; action: FeedbackAction; dwell_seconds?: number }, flushNow?: boolean) => {
    if (isPreview) return;

    const item = feedItems.find((feedItem) => feedItem.repository.id === event.repo_id);
    pendingActivityBatch.current.push({
      ...event,
      serve_id: item?.repository.serveId ?? null,
      position: item?.repository.feedPosition ?? null,
    });
    
    if (flushNow || pendingActivityBatch.current.length >= 10) {
      flushActivityBatch();
    }
  }, [feedItems, flushActivityBatch, isPreview]);

  const [viewableItems, setViewableItems] = useState<string[]>([]);
  const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    setViewableItems(viewableItems.map((v: any) => v.item.feedId));
  }, []);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const nextHeight = Math.max(event.nativeEvent.layout.height, 1);
    const nextWidth = Math.max(
      Math.min(event.nativeEvent.layout.width, responsiveWidth, 520),
      1
    );
    setViewport((current) =>
      current.width === nextWidth && current.height === nextHeight
        ? current
        : { width: nextWidth, height: nextHeight }
    );
  }, [responsiveWidth]);

  if (isLoading && feedItems.length === 0) {
    return (
      <View style={[styles.outer, styles.centered]} onLayout={handleLayout}>
        <ActivityIndicator size="large" color={REFERENCE_THEME.accent} />
      </View>
    );
  }

  if (isError && feedItems.length === 0) {
    return (
      <View style={[styles.outer, styles.centered, styles.message]} onLayout={handleLayout}>
        <Text style={styles.messageTitle}>Couldn&apos;t load your recommendations</Text>
        <Text style={styles.messageBody}>
          {error instanceof Error ? error.message : 'The feed service is unavailable.'}
        </Text>
        <Pressable style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryText}>Try again</Text>
        </Pressable>
      </View>
    );
  }

  if (!isLoading && feedItems.length === 0) {
    return (
      <View style={[styles.outer, styles.centered, styles.message]} onLayout={handleLayout}>
        <Text style={styles.messageTitle}>Building your personalized feed</Text>
        <Text style={styles.messageBody}>
          Your onboarding choices were saved. Retry while ML prepares recommendations.
        </Text>
        <Pressable style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryText}>Load recommendations</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.outer} onLayout={handleLayout}>
      <View style={[styles.feedShell, { width: pageWidth, height: pageHeight }]}>
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
          viewabilityConfig={VIEWABILITY_CONFIG}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: REFERENCE_THEME.canvas,
  },
  centered: {
    justifyContent: 'center',
  },
  message: {
    paddingHorizontal: 32,
  },
  messageTitle: {
    color: REFERENCE_THEME.text,
    fontFamily: 'NataSans-SemiBold',
    fontSize: 20,
    textAlign: 'center',
  },
  messageBody: {
    marginTop: 8,
    color: REFERENCE_THEME.textSecondary,
    fontFamily: 'NataSans-Regular',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    borderRadius: 10,
    backgroundColor: REFERENCE_THEME.accent,
    paddingHorizontal: 22,
    paddingVertical: 12,
  },
  retryText: {
    color: REFERENCE_THEME.text,
    fontFamily: 'NataSans-SemiBold',
    fontSize: 14,
  },
  feedShell: {
    backgroundColor: REFERENCE_THEME.background,
    overflow: 'hidden',
    position: 'relative',
  },
  feedList: {
    flex: 1,
    width: '100%',
  },
  feedListContent: {
    flexGrow: 0,
  },
});
