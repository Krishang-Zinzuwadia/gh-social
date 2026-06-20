import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { FlatList, ListRenderItemInfo, StatusBar, View } from 'react-native';
import Header from '../components/Header';
import RepoCard from '../components/RepoCard';
import SearchBar from '../components/SearchBar';
import TabBar from '../components/TabBar';
import SkeletonCard from '../components/SkeletonCard';
import { FOR_YOU_REPOS } from '../data/repos';
import { Repo, TabName } from '../types';

export default function ForYouScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const filtered: Repo[] = FOR_YOU_REPOS.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  
  const skeletonData = Array.from({ length: 6 }, (_, i) => ({ id: `skeleton-${i}` }));
  const data = isLoading ? skeletonData : filtered;

  const handleTabChange = (tab: TabName) => {
    if (tab === 'Trending') router.push('/explore');
  };

  const renderCard = ({ item }: ListRenderItemInfo<Repo | { id: string }>) => (
    <View className="flex-1">
      {isLoading ? (
        <SkeletonCard height={85} />
      ) : (
        <RepoCard repo={item as Repo} />
      )}
    </View>
  );

  return (
    <View className="flex-1 bg-[#111111]">
      <StatusBar barStyle="light-content" backgroundColor="#111111" />
      <Header />
      <View className="pt-3">
        <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
      </View>
      <TabBar activeTab="For you" onTabChange={handleTabChange} />
      <FlatList<any>
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={renderCard}
        numColumns={2}
        columnWrapperStyle={{ gap: 10, paddingHorizontal: 16 }}
        contentContainerStyle={{ paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}