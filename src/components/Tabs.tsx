import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";

type Props = {
  active: string;
};

export default function Tabs({ active }: Props) {
  return (
    <View className="flex-row justify-center gap-24 mt-10">
      <Pressable
        onPress={() => router.push("/")}
      >
        <Text
          className={`text-lg ${
            active === "overview"
              ? "text-[#7BC96F]"
              : "text-white"
          }`}
        >
          Overview
        </Text>

        {active === "overview" && (
          <View className="h-[2px] bg-[#7BC96F] mt-1" />
        )}
      </Pressable>

      <Pressable
        onPress={() => router.push("/about")}
      >
        <Text
          className={`text-lg ${
            active === "repo"
              ? "text-[#7BC96F]"
              : "text-white"
          }`}
        >
          Repositories
        </Text>

        {active === "repo" && (
          <View className="h-[2px] bg-[#7BC96F] mt-1" />
        )}
      </Pressable>
    </View>
  );
}