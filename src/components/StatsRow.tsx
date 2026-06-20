import { View, Text } from "react-native";

const stats = [
  {
    icon: "♡",
    value: "1.2K",
    label: "Likes given",
  },
  {
    icon: "👤",
    value: "300",
    label: "Followers",
  },
  {
    icon: "🔖",
    value: "156",
    label: "Saved",
  },
  {
    icon: "👥",
    value: "289",
    label: "Following",
  },
];

export default function StatsRow() {
  return (
    <View className="flex-row justify-around mt-10 px-2">
      {stats.map((item, index) => (
        <View
          key={index}
          className="flex-row items-center"
        >
          <View className="items-center w-20">
            <Text className="text-[#7BC96F] text-2xl">
              {item.icon}
            </Text>

            <Text className="text-white font-bold text-2xl">
              {item.value}
            </Text>

            <Text className="text-gray-300 text-xs text-center">
              {item.label}
            </Text>
          </View>

          {index !== stats.length - 1 && (
            <View className="w-px h-14 bg-gray-500 ml-4" />
          )}
        </View>
      ))}
    </View>
  );
}