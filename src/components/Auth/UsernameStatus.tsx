import { View, Text } from "react-native";

export default function UsernameStatus() {
  return (
    <View className="flex-row items-center mt-4">
      <View className="w-4 h-4 rounded-full border border-[#6DA963]" />

      <Text
        style={{ fontFamily: "NataSans-Regular" }}
        className="text-[#6DA963] ml-3 text-sm font-nata"
      >
        This username looks good!
      </Text>
    </View>
  );
}