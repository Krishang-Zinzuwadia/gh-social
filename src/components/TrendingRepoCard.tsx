import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import GitBranchIcon from '../assets/icons/git-branch.svg';
import StarIcon from '../assets/icons/star.svg';
import { Repo } from '../types';
import Avatar from './Avatar';

const LANGUAGE_COLORS: Record<string, string> = {
  Python: '#3B82F6',
  TypeScript: '#2563EB',
  JavaScript: '#F59E0B',
  Rust: '#F97316',
  Go: '#14B8A6',
};

interface TrendingRepoCardProps {
  repo: Repo;
  rank: number;
  onPress?: () => void;
}

const regular = { fontFamily: 'NotoSans_400Regular' };
const bold = { fontFamily: 'NotoSans_700Bold' };

export default function TrendingRepoCard({ repo, rank, onPress }: TrendingRepoCardProps): React.JSX.Element {
  const langColor = repo.language ? LANGUAGE_COLORS[repo.language] ?? '#6B7280' : '#6B7280';

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-[#1C1C1E] rounded-xl p-4 mb-3 border border-[#2C2C2E]"
      activeOpacity={0.7}
    >
      <View className="flex-row items-center mb-2" style={{ gap: 10 }}>
        <Text className="text-[#6B7280] text-xs w-5" style={bold}>#{rank}</Text>
        <Text className="text-white text-sm flex-1" numberOfLines={1} style={bold}>
          {repo.name}
        </Text>
      </View>
      {repo.description && (
        <Text className="text-[#9CA3AF] text-xs mb-3 leading-5" numberOfLines={2} style={regular}>
          {repo.description}
        </Text>
      )}
      <View className="flex-row items-center" style={{ gap: 14 }}>
        {repo.language && (
          <View className="flex-row items-center" style={{ gap: 5 }}>
            <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: langColor }} />
            <Text className="text-[#9CA3AF] text-xs" style={regular}>{repo.language}</Text>
          </View>
        )}
        <View className="flex-row items-center" style={{ gap: 4 }}>
          <StarIcon stroke="#FBBF24" width={12} height={12} />
          <Text className="text-[#9CA3AF] text-xs" style={regular}>{repo.stars}</Text>
        </View>
        <View className="flex-row items-center" style={{ gap: 4 }}>
          <GitBranchIcon stroke="#9CA3AF" width={12} height={12} />
          <Text className="text-[#9CA3AF] text-xs" style={regular}>{repo.forks}</Text>
        </View>
        <View className="flex-row items-center ml-auto" style={{ gap: 5 }}>
          <Avatar color={repo.avatarColor} initial={repo.avatarInitial} size={18} />
          <Text className="text-[#6B7280] text-xs" style={regular}>{repo.author}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}