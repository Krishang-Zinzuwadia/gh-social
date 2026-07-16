import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, View, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Search, UserRound } from 'lucide-react-native';
import { API_URL } from '@/constants/api';

type Person = {
  username: string;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  followers_count: number | null;
  following_count: number | null;
};

export default function ConnectionListScreen({ type }: { type: 'followers' | 'following' }) {
  const { width } = useWindowDimensions();
  const { username } = useLocalSearchParams<{ username?: string }>();
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(Boolean(username));
  const [error, setError] = useState('');
  const title = type === 'followers' ? 'Followers' : 'Following';

  useEffect(() => {
    const controller = new AbortController();
    if (!username) {
      return () => controller.abort();
    }

    fetch(`${API_URL}/users/${encodeURIComponent(username)}/${type}`, { signal: controller.signal })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error ?? `Unable to load ${type}.`);
        setPeople(payload.data);
      })
      .catch((caught) => {
        if (caught.name !== 'AbortError') setError(caught.message);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [type, username]);

  return (
    <View style={{ flex: 1, backgroundColor: '#000000', alignItems: 'center' }}>
      <FlatList
        contentInsetAdjustmentBehavior="automatic"
        style={{ width: width >= 768 ? '68%' : '100%', maxWidth: 650 }}
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: '7%', paddingBottom: '10%' }}
        data={people}
        keyExtractor={(item) => item.username}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListHeaderComponent={<View style={{ paddingTop: '8%', paddingBottom: '7%', gap: 18 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Pressable accessibilityLabel="Go back" onPress={() => router.back()} hitSlop={12} style={{ width: '15%' }}><ArrowLeft color="#F7F7F8" size={27} /></Pressable>
            <Text style={{ flex: 1, color: '#F7F7F8', textAlign: 'center', fontFamily: 'NataSans-Bold', fontSize: width < 360 ? 22 : 26 }}>{title}</Text>
            <View style={{ width: '15%', alignItems: 'flex-end' }}><Search color="#858489" size={23} /></View>
          </View>
          <Text selectable style={{ color: '#6F6E74', textAlign: 'center', fontFamily: 'NataSans-Regular' }}>@{username}</Text>
        </View>}
        ListEmptyComponent={<View style={{ minHeight: 320, flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 }}>
          {loading ? <ActivityIndicator color="#63E08A" /> : <><View style={{ width: '18%', maxWidth: 74, aspectRatio: 1, borderRadius: 999, backgroundColor: '#151515', alignItems: 'center', justifyContent: 'center' }}><UserRound size={31} color="#63E08A" /></View><Text selectable style={{ color: '#F7F7F8', fontFamily: 'NataSans-SemiBold', fontSize: 17, textAlign: 'center' }}>{!username ? 'Username is unavailable.' : error || `No ${type} yet`}</Text></>}
        </View>}
        renderItem={({ item }) => <View style={{ minHeight: width < 360 ? 70 : 78, borderRadius: 20, borderCurve: 'continuous', backgroundColor: '#151515', paddingHorizontal: '4%', flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          {item.avatar_url ? <Image source={item.avatar_url} contentFit="cover" style={{ width: '14%', maxWidth: 52, aspectRatio: 1, borderRadius: 999 }} /> : <View style={{ width: '14%', maxWidth: 52, aspectRatio: 1, borderRadius: 999, backgroundColor: '#984BE0', alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: 'white', fontFamily: 'NataSans-Bold', fontSize: 16 }}>{(item.full_name || item.username).slice(0, 2).toUpperCase()}</Text></View>}
          <View style={{ flex: 1 }}><Text numberOfLines={1} style={{ color: '#F7F7F8', fontFamily: 'NataSans-SemiBold', fontSize: width < 360 ? 14 : 16 }}>{item.full_name || item.username}</Text><Text selectable numberOfLines={1} style={{ color: '#77767C', fontFamily: 'NataSans-Regular', fontSize: 13 }}>@{item.username}</Text></View>
          <Pressable style={{ borderWidth: 1, borderColor: '#63E08A', borderRadius: 999, paddingHorizontal: '4%', paddingVertical: '2%' }}><Text style={{ color: '#63E08A', fontFamily: 'NataSans-SemiBold', fontSize: width < 360 ? 11 : 13 }}>{type === 'followers' ? 'View' : 'Following'}</Text></Pressable>
        </View>}
      />
    </View>
  );
}
