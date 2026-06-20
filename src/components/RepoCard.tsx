import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import GitBranchIcon from '../assets/icons/git-branch.svg';
import StarIcon from '../assets/icons/star.svg';
import { Repo } from '../types';
import Avatar from './Avatar';

interface RepoCardProps {
  repo: Repo;
  onPress?: () => void;
}

const regular = { fontFamily: 'NotoSans_400Regular' };
const bold = { fontFamily: 'NotoSans_700Bold' };

export default function RepoCard({ repo, onPress }: RepoCardProps): React.JSX.Element {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-[#1C1C1E] rounded-xl p-3 mb-2 border border-[#2C2C2E]"
      activeOpacity={0.7}
    >
      <Text className="text-white text-xs leading-tight mb-2" numberOfLines={2} style={bold}>
        {repo.name}
      </Text>
      <View className="flex-row items-center" style={{ gap: 10 }}>
        <View className="flex-row items-center" style={{ gap: 3 }}>
          <StarIcon stroke="#FBBF24" width={11} height={11} />
          <Text className="text-[#9CA3AF] text-xs" style={regular}>{repo.stars}</Text>
        </View>
        <View className="flex-row items-center" style={{ gap: 3 }}>
          <GitBranchIcon stroke="#9CA3AF" width={11} height={11} />
          <Text className="text-[#9CA3AF] text-xs" style={regular}>{repo.forks}</Text>
        </View>
      </View>
      <View className="flex-row items-center mt-2" style={{ gap: 5 }}>
        <Avatar color={repo.avatarColor} initial={repo.avatarInitial} size={16} />
        <Text className="text-[#6B7280] text-xs" style={regular}>{repo.author}</Text>
      </View>
    </TouchableOpacity>
  );
}