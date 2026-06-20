import { View } from "react-native";

export default function ProfileAvatar() {
  return (
    <View className="items-center">

      <View className="w-[190px] h-[190px] rounded-full bg-[#1A281E]" />

      <View className="absolute bottom-0 right-[105px]
      w-[55px] h-[55px]
      rounded-full border border-[#6DA963]
      bg-[#0A0C09]" />

    </View>
  );
}