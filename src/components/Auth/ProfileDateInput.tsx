import { View, Text, TextInput } from "react-native";

export default function ProfileDateInput() {
  return (
    <View className="mt-8">
      <Text
        style={{ fontFamily: "NataSans-Regular" }}
        className="text-white text-[15px] mb-3 font-nata"
      >
        Date of Birth
      </Text>

      <View
        className="
          w-[170px]
          h-[56px]
          bg-[#191F18]
          border border-[#6DA963]
          rounded-xl
          px-5
          justify-center
        "
      >
        <TextInput
          placeholder="DD/MM/YY"
          placeholderTextColor="#666"
          style={{ fontFamily: "NataSans-Regular" }}
          className="text-white text-[15px] font-nata"
        />
      </View>
    </View>
  );
}