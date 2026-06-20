import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import TabBar from '../components/TabBar';
import TrendingRepoCard from '../components/TrendingRepoCard';
import FeaturedRepoCard from '../components/FeaturedRepoCard';
import SkeletonCard from '../components/SkeletonCard';
import { TRENDING_REPOS, TRENDING_FEATURED } from '../data/repos';
import { FilterLanguage, FilterPeriod, TabName } from '../types';

const PERIODS: FilterPeriod[] = ['Today', 'This week', 'This month'];
const LANGUAGES: FilterLanguage[] = ['All', 'Python', 'TypeScript', 'JavaScript', 'Rust', 'Go'];

const regular = { fontFamily: 'NotoSans_400Regular' };
const medium = { fontFamily: 'NotoSans_700Bold' };

export default function TrendingScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activePeriod, setActivePeriod] = useState<FilterPeriod>('This week');
  const [activeLanguage, setActiveLanguage] = useState<FilterLanguage>('All');
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
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLanguage = activeLanguage === 'All' || r.language === activeLanguage;
    const matchesPeriod =
      activePeriod === 'This month' ||
      (activePeriod === 'This week' && (r.trendingPeriod === 'Today' || r.trendingPeriod === 'This week')) ||
      r.trendingPeriod === activePeriod;
    return matchesSearch && matchesLanguage && matchesPeriod;
  });

  return (
    <View className="flex-1 bg-[#111111]">
      <StatusBar barStyle="light-content" backgroundColor="#111111" />
      <Header />

      <View className="pt-3">
        <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
      </View>

      <TabBar activeTab="Trending" onTabChange={handleTabChange} />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* Period filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-4 mb-3"
          contentContainerStyle={{ gap: 8 }}
        >
          {PERIODS.map((period) => {
            const isActive = activePeriod === period;
            return (
              <TouchableOpacity
                key={period}
                onPress={() => setActivePeriod(period)}
                className={`px-4 py-1.5 rounded-full border ${
                  isActive ? 'bg-[#22C55E] border-[#22C55E]' : 'bg-transparent border-[#2C2C2E]'
                }`}
              >
                <Text
                  className={`text-xs ${isActive ? 'text-black' : 'text-[#9CA3AF]'}`}
                  style={isActive ? medium : regular}
                >
                  {period}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Language filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-4 mb-4"
          contentContainerStyle={{ gap: 8 }}
        >
          {LANGUAGES.map((lang) => {
            const isActive = activeLanguage === lang;
            return (
              <TouchableOpacity
                key={lang}
                onPress={() => setActiveLanguage(lang)}
                className={`px-4 py-1.5 rounded-full border ${
                  isActive ? 'bg-[#1D4ED8] border-[#1D4ED8]' : 'bg-transparent border-[#2C2C2E]'
                }`}
              >
                <Text
                  className={`text-xs ${isActive ? 'text-white' : 'text-[#9CA3AF]'}`}
                  style={isActive ? medium : regular}
                >
                  {lang}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Featured Section */}
        {!searchQuery && activeLanguage === 'All' && (
          <View className="px-4 mb-4">
            <Text className="text-white text-sm mb-2" style={medium}>
              Featured Repository
            </Text>
            {isLoading ? (
              <SkeletonCard height={100} />
            ) : (
              <FeaturedRepoCard repo={TRENDING_FEATURED} />
            )}
          </View>
        )}

        {/* Results count */}
        <View className="px-4 mb-3">
          <Text className="text-[#6B7280] text-xs" style={regular}>
            {isLoading
              ? 'Loading repositories...'
              : `${filtered.length} repositories trending ${activePeriod.toLowerCase()}`}
          </Text>
        </View>

        {/* Repo cards */}
        <View className="px-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <SkeletonCard key={index} height={110} />
            ))
          ) : filtered.length === 0 ? (
            <View className="items-center justify-center py-16">
              <Text className="text-[#6B7280] text-sm" style={regular}>
                No repositories found
              </Text>
            </View>
          ) : (
            filtered.map((repo, index) => (
              <TrendingRepoCard key={repo.id} repo={repo} rank={index + 1} />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}