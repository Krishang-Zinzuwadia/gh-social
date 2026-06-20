import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { TabName } from '../types';

const TABS: TabName[] = ['For you', 'Trending'];

interface TabBarProps {
  activeTab: TabName;
  onTabChange: (tab: TabName) => void;
}

const regular = { fontFamily: 'NotoSans_400Regular' };
const bold = { fontFamily: 'NotoSans_700Bold' };

export default function TabBar({ activeTab, onTabChange }: TabBarProps): React.JSX.Element {
  return (
    <View className="flex-row mx-4 mb-3 border-b border-[#2C2C2E]">
      {TABS.map((tab) => {
        const isActive = activeTab === tab;
        return (
          <TouchableOpacity
            key={tab}
            onPress={() => onTabChange(tab)}
            className="mr-6 pb-2"
            style={{
              borderBottomWidth: isActive ? 2 : 0,
              borderBottomColor: isActive ? '#22C55E' : 'transparent',
            }}
          >
            <Text
              className={`text-sm ${isActive ? 'text-white' : 'text-[#6B7280]'}`}
              style={isActive ? bold : regular}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}