import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { GitBranchIcon } from '../assets/icons/GitBranchIcon';
import { MonitorIcon } from '../assets/icons/MonitorIcon';
import { StarIcon } from '../assets/icons/StarIcon';
import { Repo } from '../types';
import Avatar from './Avatar';

interface FeaturedRepoCardProps {
  repo: Repo;
  onPress?: () => void;
}

const regular = { fontFamily: 'NotoSans_400Regular' };
const bold = { fontFamily: 'NotoSans_700Bold' };

export default function FeaturedRepoCard({ repo, onPress }: FeaturedRepoCardProps): React.JSX.Element {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-[#1C1C1E] rounded-xl p-4 mb-3 border border-[#2C2C2E]"
      activeOpacity={0.7}
    >
      <View className="flex-row items-center mb-3" style={{ gap: 10 }}>
        <View className="w-9 h-9 bg-[#111827] rounded-lg items-center justify-center border border-[#374151]">
          <MonitorIcon color="#6B7280" size={18} />
        </View>
        <Text className="text-white text-sm flex-1" numberOfLines={1} style={bold}>
          {repo.name}
        </Text>
      </View>
      <View className="flex-row items-center" style={{ gap: 16 }}>
        <View className="flex-row items-center" style={{ gap: 4 }}>
          <StarIcon color="#FBBF24" size={13} />
          <Text className="text-[#9CA3AF] text-xs" style={regular}>{repo.stars}</Text>
        </View>
        <View className="flex-row items-center" style={{ gap: 4 }}>
          <GitBranchIcon color="#9CA3AF" size={13} />
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