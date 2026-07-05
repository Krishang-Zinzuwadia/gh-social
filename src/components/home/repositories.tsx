import { View, Text, useWindowDimensions, ActivityIndicator } from "react-native"
import Svg, { Path, Circle } from "react-native-svg"
import RecentPins from "../recentpins"
import { useInfiniteQuery } from "@tanstack/react-query"
import * as SecureStore from "expo-secure-store"
import { getSavedRepos } from "../../api/activity"

interface RepositoriesProps {
  userId?: string;
}

export default function Repositories({ userId }: RepositoriesProps) {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const fetchSavedRepos = async ({ pageParam = 0 }) => {
    if (!userId) return [];
    const token = await SecureStore.getItemAsync("access_token");
    if (!token) throw new Error("No token");
    return getSavedRepos(userId, token, 15, pageParam);
  };

  const {
    data: savedReposData,
    isLoading: isLoadingRepos,
  } = useInfiniteQuery({
    queryKey: ["savedRepos", userId],
    queryFn: fetchSavedRepos,
    getNextPageParam: (lastPage, allPages) => lastPage.length === 15 ? allPages.length * 15 : undefined,
    initialPageParam: 0,
    enabled: !!userId,
  });

  const pinnedRepos = savedReposData?.pages.flat() || [];

  if (isTablet) {
    return (
      <View className="w-full border border-[#8EFF7A] rounded-[10px] bg-[#191F18] px-4 pt-[24px] pb-[24px] justify-start relative overflow-visible">
        {/* Right segment (aligned to left of Repositories tab) */}
        <Svg
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: '50%',
            marginLeft: -16,
            top: -42,
            width: 20,
            height: 30
          }}
          viewBox="0 0 20 30"
          fill="none"
        >
          <Circle cx={16} cy={4} r={3.5} stroke="#8EFF7A" />
          <Circle cx={16} cy={4} r={1.9} fill="white" stroke="#8EFF7A" />
          <Path d="M16 7.5 L16 22 Q16 28 10 28 L0 28" stroke="#8EFF7A" strokeWidth="1.5" fill="none" />
        </Svg>

        {/* Floating middle line */}
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: 32,
            right: '50%',
            marginRight: 16,
            top: -14.5,
            height: 1.5,
            backgroundColor: '#8EFF7A'
          }}
        />

        {/* Left segment (floating dot and vertical drop) */}
        <Svg
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: 24,
            top: -18,
            width: 16,
            height: 20
          }}
          viewBox="0 0 16 20"
          fill="none"
        >
          <Circle cx={8} cy={4} r={3.5} stroke="#8EFF7A" />
          <Circle cx={8} cy={4} r={1.9} fill="white" stroke="#8EFF7A" />
          <Path d="M8 7.5 L8 20" stroke="#8EFF7A" strokeWidth="1.5" fill="none" />
        </Svg>

        <View style={{ width: '100%' }}>
          {isLoadingRepos ? (
            <ActivityIndicator size="small" color="#8EFF7A" style={{ marginTop: 20 }} />
          ) : pinnedRepos.length > 0 ? (
            pinnedRepos.map((item: any, idx: number) => (
              <RecentPins key={`pin-${item.activity_id || idx}`} title={item.repo?.repo_name || "Repository"} isPinned={true} />
            ))
          ) : (
            <Text className="text-[#8A8A8A] text-[14px] font-noto text-center py-4">No recent saves</Text>
          )}
        </View>
      </View>
    )
  }

  return (
    // Repositories Box
    <View className="w-full border border-[#8EFF7A] rounded-[10px] bg-[#191F18] px-4 pt-[24px] pb-[24px] relative overflow-visible">
        {/* Right segment (aligned to left of Repositories tab) */}
        <Svg
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: '50%',
            marginLeft: -16,
            top: -42,
            width: 20,
            height: 30
          }}
          viewBox="0 0 20 30"
          fill="none"
        >
          <Circle cx={16} cy={4} r={3.5} stroke="#8EFF7A" />
          <Circle cx={16} cy={4} r={1.9} fill="white" stroke="#8EFF7A" />
          <Path d="M16 7.5 L16 22 Q16 28 10 28 L0 28" stroke="#8EFF7A" strokeWidth="1.5" fill="none" />
        </Svg>

        {/* Floating middle line */}
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: 32,
            right: '50%',
            marginRight: 16,
            top: -14.5,
            height: 1.5,
            backgroundColor: '#8EFF7A'
          }}
        />

        {/* Left segment (floating dot and vertical drop) */}
        <Svg
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: 24,
            top: -18,
            width: 16,
            height: 20
          }}
          viewBox="0 0 16 20"
          fill="none"
        >
          <Circle cx={8} cy={4} r={3.5} stroke="#8EFF7A" />
          <Circle cx={8} cy={4} r={1.9} fill="white" stroke="#8EFF7A" />
          <Path d="M8 7.5 L8 20" stroke="#8EFF7A" strokeWidth="1.5" fill="none" />
        </Svg>
        
      <View style={{ width: '100%' }}>
        {isLoadingRepos ? (
          <ActivityIndicator size="small" color="#8EFF7A" style={{ marginTop: 20 }} />
        ) : pinnedRepos.length > 0 ? (
          pinnedRepos.map((item: any, idx: number) => (
            <RecentPins key={`pin-${item.activity_id || idx}`} title={item.repo?.repo_name || "Repository"} isPinned={true} />
          ))
        ) : (
          <Text className="text-[#8A8A8A] text-[14px] font-noto text-center py-4">No recent saves</Text>
        )}
      </View>
    </View>
  )
}