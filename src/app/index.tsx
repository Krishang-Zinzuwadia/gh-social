import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, ListRenderItemInfo, StatusBar, View } from 'react-native';
import Header from '../components/Header';
import RepoCard from '../components/RepoCard';
import SearchBar from '../components/SearchBar';
import TabBar from '../components/TabBar';
import { FOR_YOU_REPOS } from '../data/repos';
import { Repo, TabName } from '../types';

function buildColumns(repos: Repo[]) {
  return repos.reduce<{ left: Repo[]; right: Repo[] }>(
    (acc, repo, i) => {
      i % 2 === 0 ? acc.left.push(repo) : acc.right.push(repo);
      return acc;
    },
    { left: [], right: [] },
  );
}

export default function ForYouScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = FOR_YOU_REPOS.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  const { left, right } = buildColumns(filtered);

  const handleTabChange = (tab: TabName) => {
    if (tab === 'Trending') router.push('/explore');
  };

  const renderCard = ({ item }: ListRenderItemInfo<Repo>) => <RepoCard repo={item} />;

  return (
    <View className="flex-1 bg-[#111111]">
      <StatusBar barStyle="light-content" backgroundColor="#111111" />
      <Header />
      <View className="pt-3">
        <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
      </View>
      <TabBar activeTab="For you" onTabChange={handleTabChange} />
      <View className="flex-1 flex-row px-4" style={{ gap: 10 }}>
        <View className="flex-1">
          <FlatList<Repo>
            data={left}
            keyExtractor={(item) => `left-${item.id}`}
            renderItem={renderCard}
            showsVerticalScrollIndicator={false}
          />
        </View>
        <View className="flex-1">
          <FlatList<Repo>
            data={right}
            keyExtractor={(item) => `right-${item.id}`}
            renderItem={renderCard}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>
    </View>
  );
}