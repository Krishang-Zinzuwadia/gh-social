import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { ScrollView, StatusBar, View, Text } from 'react-native';
import Header from '../components/Header';
import RepoCard from '../components/RepoCard';
import SearchBar from '../components/SearchBar';
import TabBar from '../components/TabBar';
import SkeletonCard from '../components/SkeletonCard';
import { FOR_YOU_REPOS } from '../data/repos';
import { Repo, TabName } from '../types';

const regular = { fontFamily: 'NotoSans_400Regular' };

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

  const leftColData = data.filter((_, idx) => idx % 2 === 0);
  const rightColData = data.filter((_, idx) => idx % 2 !== 0);

  const renderEmpty = () => {
    if (isLoading || data.length > 0) return null;
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
      <TabBar activeTab="For you" onTabChange={handleTabChange} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {renderEmpty()}
        
        {data.length > 0 && (
          <View className="flex-row px-4" style={{ gap: 10 }}>
            {/* Left Column */}
            <View className="flex-1" style={{ gap: 8 }}>
              {leftColData.map((item) => (
                <View key={item.id}>
                  {isLoading ? (
                    <SkeletonCard height={85} />
                  ) : (
                    <RepoCard repo={item as Repo} />
                  )}
                </View>
              ))}
            </View>

            {/* Right Column */}
            <View className="flex-1" style={{ gap: 8 }}>
              {rightColData.map((item) => (
                <View key={item.id}>
                  {isLoading ? (
                    <SkeletonCard height={85} />
                  ) : (
                    <RepoCard repo={item as Repo} />
                  )}
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}