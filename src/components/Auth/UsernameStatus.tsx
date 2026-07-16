import { View, Text } from "react-native";
import { Check } from "lucide-react-native";

export default function UsernameStatus() {
  return (
    <View className="flex-row items-center mt-4">
      <View className="w-4 h-4 rounded-full border border-[#63E08A] justify-center items-center bg-[#63E08A]">
        <Check size={10} color="#FFFFFF" strokeWidth={3} />
      </View>

      <Text
        className="text-[#63E08A] ml-3 text-sm font-nata"
      >
        This username looks good!
      </Text>
    </View>
  );
}
