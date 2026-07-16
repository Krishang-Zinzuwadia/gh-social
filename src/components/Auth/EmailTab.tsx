import { Text, View } from "react-native";
import { MailIcon } from "./icons";

export default function EmailTab() {
  return (
    <View className="h-[46px] border border-[#63E08A] rounded-xl bg-[#1C1C1E] flex-row justify-center items-center">
      <MailIcon size={18} />

      <Text
        className="text-[#63E08A] ml-2 text-[13px] font-nata"
      >
        Email
      </Text>
    </View>
  );
}
