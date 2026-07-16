import { useMemo, useState } from 'react';
import { Linking, ScrollView, StatusBar, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import RepoCard from '../../components/explore/RepoCard';
import SearchBar from '../../components/explore/SearchBar';
import TabBar from '../../components/explore/TabBar';
import TrendingRepoCard from '../../components/explore/TrendingRepoCard';
import { Repo, TabName } from '../../types';

const EXPLORE_REPOS: Repo[] = [
  {
    id: 'interview-prep-bot',
    name: 'interview-prep-bot',
    description: 'Mock interviews with an LLM that grades your answers.',
    stars: '5K',
    forks: '1.2K',
    author: 'codebyalex',
    avatarInitial: 'CA',
    avatarColor: '#64D2FF',
    avatarGradient: ['#64D2FF', '#2A7FBF'],
  },
  {
    id: 'awesome-open-source',
    name: 'awesome-open-source',
    description: 'A curated list of beginner friendly open source projects.',
    stars: '5K',
    forks: '1.2K',
    author: 'techcollective',
    avatarInitial: 'TC',
    avatarColor: '#FFB340',
    avatarGradient: ['#FFB340', '#E08700'],
  },
  {
    id: 'open-source-file-finder',
    name: 'open-source-file-finder',
    description: 'Search any repo for the file you need, instantly.',
    stars: '5K',
    forks: '1.2K',
    author: 'appstudio',
    avatarInitial: 'AS',
    avatarColor: '#BF5AF2',
    avatarGradient: ['#BF5AF2', '#8944AB'],
  },
  {
    id: 'crypto-price-tracker',
    name: 'crypto-price-tracker',
    description: 'Realtime prices in the terminal with alerts.',
    stars: '5K',
    forks: '1.2K',
    author: 'backendninja',
    avatarInitial: 'BN',
    avatarColor: '#63E6A9',
    avatarGradient: ['#63E6A9', '#2E9E6B'],
  },
  {
    id: 'tinylens',
    name: 'tinylens',
    description: 'Computer vision in 300 lines of Python.',
    stars: '412',
    forks: '38',
    author: 'p_arthy',
    avatarInitial: 'PA',
    avatarColor: '#FFB340',
    avatarGradient: ['#FFB340', '#E08700'],
  },
  {
    id: 'vector-vault',
    name: 'vector-vault',
    description: 'An embedded vector database in Rust.',
    stars: '12.4K',
    forks: '890',
    author: 'stellar_labs',
    avatarInitial: 'SL',
    avatarColor: '#BF5AF2',
    avatarGradient: ['#BF5AF2', '#8944AB'],
  },
  {
    id: 'hooks-zero',
    name: 'hooks-zero',
    description: 'React hooks with zero re-renders.',
    stars: '15.9K',
    forks: '1.2K',
    author: 'devanshi_k',
    avatarInitial: 'DK',
    avatarColor: '#FF6482',
    avatarGradient: ['#FF6482', '#C93A56'],
  },
  {
    id: 'git-recap',
    name: 'git-recap',
    description: 'Your git year, wrapped into a share card.',
    stars: '8.1K',
    forks: '460',
    author: 'ok_computer',
    avatarInitial: 'OC',
    avatarColor: '#63E6A9',
    avatarGradient: ['#63E6A9', '#2E9E6B'],
  },
];

const TRENDING_REPOS = [...EXPLORE_REPOS].reverse();

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabName>('For you');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRepos = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const source = activeTab === 'For you' ? EXPLORE_REPOS : TRENDING_REPOS;

    if (!q) return source;

    return source.filter((repo) => {
      return (
        repo.name.toLowerCase().includes(q) ||
        repo.author.toLowerCase().includes(q) ||
        repo.description?.toLowerCase().includes(q)
      );
    });
  }, [activeTab, searchQuery]);

  const leftColumn = filteredRepos.filter((_, index) => index % 2 === 0);
  const rightColumn = filteredRepos.filter((_, index) => index % 2 !== 0);

  const handleTabChange = (tab: TabName) => {
    setActiveTab(tab);
    setSearchQuery('');
  };

  const handleRepoPress = (repo: Repo) => {
    const url = `https://github.com/${repo.author}/${repo.name}`;
    Linking.openURL(url).catch(() => undefined);
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'rgb(0, 0, 0)' }}>
      <StatusBar barStyle="light-content" backgroundColor="rgb(0, 0, 0)" />
      <View
        style={{
          zIndex: 10,
          elevation: 10,
          backgroundColor: 'rgb(0, 0, 0)',
          paddingTop: Math.max(28, insets.top + 16),
          paddingBottom: 10,
        }}
      >
        <Text
          style={{
            color: '#FFFFFF',
            paddingHorizontal: 20,
            fontSize: 30,
            fontWeight: '700',
            letterSpacing: 0,
          }}
        >
          Explore
        </Text>
        <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
        <TabBar activeTab={activeTab} onTabChange={handleTabChange} />
      </View>
      <ScrollView
        style={{ flex: 1, backgroundColor: 'rgb(0, 0, 0)' }}
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: Math.max(120, insets.bottom + 96),
        }}
      >
        {activeTab === 'For you' ? (
          <View style={{ flexDirection: 'row', gap: 10, paddingTop: 8, paddingHorizontal: 20 }}>
            <View style={{ flex: 1, gap: 10 }}>
              {leftColumn.map((repo) => (
                <RepoCard key={repo.id} repo={repo} onPress={() => handleRepoPress(repo)} />
              ))}
            </View>
            <View style={{ flex: 1, gap: 10, paddingTop: 30 }}>
              {rightColumn.map((repo) => (
                <RepoCard key={repo.id} repo={repo} onPress={() => handleRepoPress(repo)} />
              ))}
            </View>
          </View>
        ) : (
          <View style={{ paddingTop: 12, paddingHorizontal: 9, gap: 10 }}>
            {filteredRepos.map((repo, index) => (
              <TrendingRepoCard
                key={repo.id}
                repo={repo}
                rank={searchQuery.trim() ? undefined : index + 1}
                onPress={() => handleRepoPress(repo)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
