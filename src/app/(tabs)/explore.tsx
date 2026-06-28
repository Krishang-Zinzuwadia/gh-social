import { useState, useEffect } from 'react';
import { ScrollView, FlatList, StatusBar, View, Text, ListRenderItemInfo, useWindowDimensions, Platform, Linking } from 'react-native';
import { API_URL } from '../../api/config';
import Header from '../../components/explore/Header';
import RepoCard from '../../components/explore/RepoCard';
import SearchBar from '../../components/explore/SearchBar';
import TabBar from '../../components/explore/TabBar';
import TrendingRepoCard from '../../components/explore/TrendingRepoCard';
import SkeletonCard from '../../components/explore/SkeletonCard';
import { getResponsiveContainerStyle } from '../../components/responsive-layout';
import { FOR_YOU_REPOS, TRENDING_REPOS } from '../../data/repos';
import { Repo, TabName } from '../../types';
import { APP_THEME } from '../../constants/theme';

const regular = { fontFamily: 'NataSans-Regular' };

export default function ExploreScreen() {
  const { width } = useWindowDimensions();
  const [activeTab, setActiveTab] = useState<TabName>('For you');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [trendingRepos, setTrendingRepos] = useState<Repo[]>([]);
  const [isTrendingLoading, setIsTrendingLoading] = useState(true);
  const responsiveContainerStyle = getResponsiveContainerStyle(width);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [activeTab]);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        setIsTrendingLoading(true);
        const response = await fetch(`${API_URL}/repos/trending?limit=10`);
        const result = await response.json();
        
        if (result.success && result.data) {
          const mappedRepos: Repo[] = result.data.map((repo: any) => ({
            id: repo.repo_id,
            name: repo.repo_name,
            stars: (repo.star_count || 0).toString(),
            forks: (repo.forks_count || 0).toString(),
            author: repo.owner_id,
            avatarColor: '#10B981',
            avatarInitial: repo.repo_name.charAt(0).toUpperCase(),
            hasIcon: true,
            language: repo.language_used?.[0] || 'Unknown',
            description: repo.description || repo.readme_summary || 'No description available',
            trendingPeriod: 'Today',
          }));
          setTrendingRepos(mappedRepos);
        }
      } catch (error) {
        console.error('Failed to fetch trending repos', error);
      } finally {
        setIsTrendingLoading(false);
      }
    };
    
    fetchTrending();
  }, []);

  const handleTabChange = (tab: TabName) => {
    setActiveTab(tab);
    setSearchQuery('');
    setIsLoading(true);
  };

  const handleRepoPress = (repo: Repo) => {
    const url = `https://github.com/${repo.author}/${repo.name}`;
    Linking.openURL(url).catch(err => console.error('Failed to open GitHub link:', err));
  };

  const filteredForYou: Repo[] = FOR_YOU_REPOS.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const skeletonDataForYou = Array.from({ length: 6 }, (_, i) => ({ id: `skeleton-${i}` }));
  const dataForYou = isLoading ? skeletonDataForYou : filteredForYou;
  const leftColData = dataForYou.filter((_, idx) => idx % 2 === 0);
  const rightColData = dataForYou.filter((_, idx) => idx % 2 !== 0);

  const filteredTrending = trendingRepos.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const skeletonDataTrending = Array.from({ length: 5 }, (_, i) => ({ id: `skeleton-${i}`, isSkeleton: true }));
  const dataTrending = isTrendingLoading
    ? skeletonDataTrending
    : searchQuery
    ? filteredTrending
    : trendingRepos;

  const renderTrendingCard = ({ item }: ListRenderItemInfo<any>) => (
    <View className="px-4">
      {item.isSkeleton ? (
        <SkeletonCard height={120} />
      ) : (
        <TrendingRepoCard repo={item} onPress={() => handleRepoPress(item)} />
      )}
    </View>
  );

  const renderEmptyState = (hasData: boolean) => {
    if (isLoading || hasData) return null;
    return (
      <View className="items-center justify-center py-16">
        <Text className="text-[#6B7280] text-sm" style={regular}>
          No repositories found
        </Text>
      </View>
    );
  };

  const renderEmptyTrendingState = (hasData: boolean) => {
    if (isTrendingLoading || hasData) return null;
    return (
      <View className="items-center justify-center py-20 px-6">
        <View className="w-20 h-20 rounded-full bg-[#1E241E] items-center justify-center mb-6 border border-[#6DA963]/30">
          <Text style={{ fontSize: 32 }}>🌱</Text>
        </View>
        <Text className="text-white text-lg font-semibold mb-2 text-center" style={{ fontFamily: 'NataSans-Bold' }}>
          Trending is quiet today
        </Text>
        <Text className="text-[#A49898] text-sm text-center leading-5" style={regular}>
          We couldn't find any trending repositories at the moment. Check back later to discover what the community is building.
        </Text>
      </View>
    );
  };

  return (
    <View className="flex-1" style={{ backgroundColor: APP_THEME.background }}>
      <StatusBar barStyle="light-content" backgroundColor={APP_THEME.background} />
      <View style={[{ flex: 1, width: '100%' }, responsiveContainerStyle]}>
        <Header />

        <View className="pt-3">
          <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
        </View>

        <TabBar activeTab={activeTab} onTabChange={handleTabChange} />

        {activeTab === 'For you' ? (
          <ScrollView
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 24, paddingTop: 12 }}
          >
            {renderEmptyState(dataForYou.length > 0)}

            {dataForYou.length > 0 && (
              <View className="flex-row px-4" style={{ gap: 16 }}>
                <View className="flex-1" style={{ gap: 16 }}>
                  {leftColData.map((item) => (
                    <View key={item.id}>
                      {isLoading ? (
                        <SkeletonCard height={95} />
                      ) : (
                        <RepoCard repo={item as Repo} onPress={() => handleRepoPress(item as Repo)} />
                      )}
                    </View>
                  ))}
                </View>

                <View className="flex-1" style={{ gap: 16 }}>
                  {rightColData.map((item) => (
                    <View key={item.id}>
                      {isLoading ? (
                        <SkeletonCard height={95} />
                      ) : (
                        <RepoCard repo={item as Repo} onPress={() => handleRepoPress(item as Repo)} />
                      )}
                    </View>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>
        ) : (
          <FlatList<any>
            style={{ flex: 1 }}
            data={dataTrending}
            keyExtractor={(item) => item.id}
            renderItem={renderTrendingCard}
            contentContainerStyle={{ paddingBottom: 24, paddingTop: 12, gap: 16 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderEmptyTrendingState(dataTrending.length > 0)}
          />
        )}
      </View>
    </View>
  );
}
