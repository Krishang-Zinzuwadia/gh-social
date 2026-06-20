import { Text, View } from "react-native";

function Rule({ text }: { text: string }) {
  return (
    <View className="flex-row items-center mt-2">
      <View className="w-3 h-3 rounded-full border border-[#6DA963]" />

      <Text
        style={{ fontFamily: "NataSans-Regular" }}
        className="text-[#9B9B9B] ml-3 text-[12px] font-nata"
      >
        {text}
      </Text>
    </View>
  );
}

export default function PasswordRules() {
  return (
    <View className="mt-5">
      <Rule text="At least 8 characters" />
      <Rule text="Includes a number" />
      <Rule text="Includes an uppercase letter" />
    </View>
  );
}