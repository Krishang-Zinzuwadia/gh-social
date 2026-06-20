import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { FlatList, StatusBar, View, Text, ListRenderItemInfo } from 'react-native';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import TabBar from '../components/TabBar';
import TrendingRepoCard from '../components/TrendingRepoCard';
import SkeletonCard from '../components/SkeletonCard';
import { TRENDING_REPOS } from '../data/repos';
import { TabName } from '../types';

const regular = { fontFamily: 'NotoSans_400Regular' };

export default function TrendingScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleTabChange = (tab: TabName) => {
    if (tab === 'For you') router.push('/');
  };

  const filtered = TRENDING_REPOS.filter((r) => {
    return r.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const skeletonData = Array.from({ length: 5 }, (_, i) => ({ id: `skeleton-${i}`, isSkeleton: true }));
  
  const data = isLoading
    ? skeletonData
    : searchQuery
    ? filtered
    : [
        TRENDING_REPOS[0],
        { id: 'skeleton-1', isSkeleton: true },
        { id: 'skeleton-2', isSkeleton: true },
        { id: 'skeleton-3', isSkeleton: true },
        { id: 'skeleton-4', isSkeleton: true },
      ];

  const renderCard = ({ item }: ListRenderItemInfo<any>) => (
    <View className="px-4">
      {item.isSkeleton ? (
        <SkeletonCard height={110} />
      ) : (
        <TrendingRepoCard repo={item} />
      )}
    </View>
  );

  const renderEmpty = () => {
    if (isLoading) return null;
    return (
      <View className="items-center justify-center py-16">
        <Text className="text-[#6B7280] text-sm" style={regular}>
          No repositories found
        </Text>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-[#0D0E0D]">
      <StatusBar barStyle="light-content" backgroundColor="#0D0E0D" />
      <Header />

      <View className="pt-3">
        <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
      </View>

      <TabBar activeTab="Trending" onTabChange={handleTabChange} />

      <FlatList<any>
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={renderCard}
        contentContainerStyle={{ paddingBottom: 24, gap: 12 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmpty}
      />
    </View>
  );
}