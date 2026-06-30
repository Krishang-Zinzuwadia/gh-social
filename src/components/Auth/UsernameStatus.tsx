import { View, Text } from "react-native";
import { Check } from "lucide-react-native";

export default function UsernameStatus() {
  return (
    <View className="flex-row items-center mt-4">
      <View className="w-4 h-4 rounded-full border border-[#8EFF7A] justify-center items-center bg-[#8EFF7A]">
        <Check size={10} color="#0A0C09" strokeWidth={3} />
      </View>

      <Text
        className="text-[#8EFF7A] ml-3 text-sm font-nata"
      >
        This username looks good!
      </Text>
    </View>
  );
}