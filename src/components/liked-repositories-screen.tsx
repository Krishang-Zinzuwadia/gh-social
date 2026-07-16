import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Linking, Pressable, Text, View, useWindowDimensions } from 'react-native';
import { ArrowLeft, FolderGit2, GitFork, Heart, Search, Star } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { API_URL } from '@/constants/api';
import { AUTH_BYPASS_ENABLED } from '@/constants/auth';
import { REPOSITORIES } from '@/data/repositories';
import { formatCompactCount } from '@/utils/format-count';

type LikedRepository = {
  repo_id: string;
  github_repo_url: string;
  owner_id: string;
  repo_name: string;
  full_name: string;
  description: string | null;
  language_used: unknown;
  topics: unknown;
  likes_count: number | null;
  star_count: number | null;
  forks_count: number | null;
};

const demoCounts = [
  { likes: 412, stars: 1200, forks: 2000 },
  { likes: 288, stars: 980, forks: 1500 },
  { likes: 156, stars: 2100, forks: 3200 },
];

const bypassLikedRepositories: LikedRepository[] = REPOSITORIES.slice(0, 3).map((repository, index) => ({
  repo_id: repository.id,
  github_repo_url: `https://github.com/${repository.owner}/${repository.title}`,
  owner_id: repository.owner,
  repo_name: repository.title,
  full_name: `${repository.owner}/${repository.title}`,
  description: repository.description,
  language_used: repository.techStack ?? [],
  topics: [],
  likes_count: demoCounts[index].likes,
  star_count: demoCounts[index].stars,
  forks_count: demoCounts[index].forks,
}));

export default function LikedRepositoriesScreen() {
  const { width } = useWindowDimensions();
  const { username } = useLocalSearchParams<{ username?: string }>();
  const [repositories, setRepositories] = useState<LikedRepository[]>(
    AUTH_BYPASS_ENABLED ? bypassLikedRepositories : [],
  );
  const [loading, setLoading] = useState(Boolean(username) && !AUTH_BYPASS_ENABLED);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    if (!username || AUTH_BYPASS_ENABLED) {
      return () => controller.abort();
    }

    fetch(`${API_URL}/users/${encodeURIComponent(username)}/likes-given`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.error ?? 'Unable to load liked repositories.');
        if (active) setRepositories(Array.isArray(payload.data) ? payload.data : []);
      })
      .catch((caught) => {
        if (active && caught.name !== 'AbortError') {
          setError(caught instanceof Error ? caught.message : 'Unable to load liked repositories.');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [username]);

  return (
    <View style={{ flex: 1, backgroundColor: '#000000', alignItems: 'center' }}>
      <FlatList
        contentInsetAdjustmentBehavior="automatic"
        style={{ width: width >= 768 ? '68%' : '100%', maxWidth: 650 }}
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: '7%', paddingBottom: '10%' }}
        data={repositories}
        keyExtractor={(item) => item.repo_id}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListHeaderComponent={<View style={{ paddingTop: '8%', paddingBottom: '7%', gap: 18 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Pressable accessibilityLabel="Go back" onPress={() => router.back()} hitSlop={12} style={{ width: '15%' }}>
              <ArrowLeft color="#F7F7F8" size={27} />
            </Pressable>
            <Text selectable style={{ flex: 1, color: '#F7F7F8', textAlign: 'center', fontFamily: 'NataSans-Bold', fontSize: width < 360 ? 22 : 26 }}>Likes Given</Text>
            <View style={{ width: '15%', alignItems: 'flex-end' }}><Search color="#858489" size={23} /></View>
          </View>
          <Text selectable style={{ color: '#6F6E74', textAlign: 'center', fontFamily: 'NataSans-Regular' }}>@{username}</Text>
        </View>}
        ListEmptyComponent={<View style={{ minHeight: 320, flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 }}>
          {loading ? <ActivityIndicator color="#63E08A" /> : <>
            <View style={{ width: '18%', maxWidth: 74, aspectRatio: 1, borderRadius: 999, backgroundColor: '#151515', alignItems: 'center', justifyContent: 'center' }}>
              <FolderGit2 size={31} color="#63E08A" />
            </View>
            <Text selectable style={{ color: '#F7F7F8', fontFamily: 'NataSans-SemiBold', fontSize: 17, textAlign: 'center' }}>
              {!username ? 'Username is unavailable.' : error || 'No liked repositories yet'}
            </Text>
          </>}
        </View>}
        renderItem={({ item }) => <Pressable
          accessibilityRole="link"
          accessibilityLabel={`Open ${item.full_name}`}
          onPress={() => Linking.openURL(item.github_repo_url)}
          style={({ pressed }) => ({
            minHeight: width < 360 ? 92 : 104,
            borderRadius: 20,
            borderCurve: 'continuous',
            backgroundColor: '#151515',
            paddingHorizontal: '4%',
            paddingVertical: 14,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 14,
            opacity: pressed ? 0.72 : 1,
          })}
        >
          <View style={{ width: '14%', maxWidth: 52, aspectRatio: 1, borderRadius: 14, borderCurve: 'continuous', backgroundColor: '#242424', alignItems: 'center', justifyContent: 'center' }}>
            <FolderGit2 size={width < 360 ? 20 : 24} color="#63E08A" />
          </View>
          <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
            <Text selectable numberOfLines={1} style={{ color: '#F7F7F8', fontFamily: 'NataSans-SemiBold', fontSize: width < 360 ? 14 : 16 }}>{item.repo_name}</Text>
            <Text selectable numberOfLines={1} style={{ color: '#77767C', fontFamily: 'NataSans-Regular', fontSize: width < 360 ? 11 : 13 }}>{item.owner_id}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 13 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}><Star size={12} color="#F5C54D" fill="#F5C54D" /><Text selectable style={{ color: '#8A898F', fontFamily: 'NataSans-Regular', fontSize: 11, fontVariant: ['tabular-nums'] }}>{formatCompactCount(item.star_count)}</Text></View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}><GitFork size={12} color="#8A898F" /><Text selectable style={{ color: '#8A898F', fontFamily: 'NataSans-Regular', fontSize: 11, fontVariant: ['tabular-nums'] }}>{formatCompactCount(item.forks_count)}</Text></View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}><Heart size={12} color="#63E08A" /><Text selectable style={{ color: '#8A898F', fontFamily: 'NataSans-Regular', fontSize: 11, fontVariant: ['tabular-nums'] }}>{formatCompactCount(item.likes_count)}</Text></View>
            </View>
          </View>
        </Pressable>}
      />
    </View>
  );
}
