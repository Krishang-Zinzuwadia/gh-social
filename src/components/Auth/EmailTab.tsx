import { Text, View } from "react-native";
import { MailIcon } from "./icons";

export default function EmailTab() {
  return (
    <View className="h-[46px] border border-[#8EFF7A] rounded-xl bg-[#191F18] flex-row justify-center items-center">
      <MailIcon size={18} />

      <Text
        className="text-[#8EFF7A] ml-2 text-[13px] font-nata"
      >
        Email
      </Text>
    </View>
  );
}