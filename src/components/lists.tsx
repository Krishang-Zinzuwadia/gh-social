import React from "react";
import { View, Text, useWindowDimensions, ActivityIndicator } from "react-native";
import { useInfiniteQuery } from "@tanstack/react-query";
import * as SecureStore from "expo-secure-store";
import RecentSaves from "./recentsaves";
import { getUserBoards } from "../api/boards";

interface ListsProps {
  userId?: string;
}

export default function Lists({ userId }: ListsProps) {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const fetchBoards = async ({ pageParam = 0 }) => {
    if (!userId) return [];
    const token = await SecureStore.getItemAsync("accessToken");
    if (!token) throw new Error("No token");
    return getUserBoards(userId, token, 10, pageParam);
  };

  const {
    data: boardsData,
    isLoading: isLoadingBoards,
  } = useInfiniteQuery({
    queryKey: ["boards", userId],
    queryFn: fetchBoards,
    getNextPageParam: (lastPage, allPages) => lastPage.length === 10 ? allPages.length * 10 : undefined,
    initialPageParam: 0,
    enabled: !!userId,
  });

  if (isLoadingBoards) {
    return (
      <View className="w-full border border-[#6DA963] rounded-[10px] bg-[#191F18] px-4 pt-[32px] pb-[24px] justify-center items-center min-h-[200px]">
        <ActivityIndicator size="large" color="#8EFF7A" />
      </View>
    );
  }

  const savedCollections = boardsData?.pages.flat() || [];

  const isEmpty = savedCollections.length === 0;

  const content = (
    <View style={{ width: "100%" }}>
      {isEmpty ? (
        <View className="items-center justify-center py-10">
          <Text className="text-[#8EFF7A] text-[18px] font-noto-bold mb-2">No Collections Yet</Text>
          <Text className="text-[#8A8A8A] text-[14px] font-noto text-center mb-6">
            Save repositories to pinned lists or create boards to organize them!
          </Text>
          <View className="bg-[#8EFF7A] px-6 py-3 rounded-full">
            <Text className="text-[#090D0A] font-noto-bold text-[14px] uppercase tracking-wide">
              Make Collections
            </Text>
          </View>
        </View>
      ) : (
        <>
          {savedCollections.length > 0 && (
            <>
              <View className="w-full px-1 mb-3.5">
                <Text className="text-[#8EFF7A] text-[12px] font-noto-bold relative top-[-2px]">
                  Saved Collections
                </Text>
              </View>
              {savedCollections.map((item: any, idx: number) => (
                <RecentSaves key={`board-${item.board_id || idx}`} title={item.board_name || "Board"} count={item.repos_count} />
              ))}
            </>
          )}
        </>
      )}
    </View>
  );

  return (
    <View className="w-full border border-[#6DA963] rounded-[10px] bg-[#191F18] px-4 pt-[32px] pb-[24px] justify-center">
      {content}
    </View>
  );
}