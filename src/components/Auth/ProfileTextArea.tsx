import { View, Text, TextInput } from "react-native";

export default function ProfileTextArea() {
  return (
    <View className="mt-8">
      <Text
        style={{ fontFamily: "NataSans-Regular" }}
        className="text-white text-[15px] mb-3 font-nata"
      >
        Bio (optional)
      </Text>

      <TextInput
        multiline
        numberOfLines={2}
        maxLength={60}
        textAlignVertical="top"
        placeholder="Tell us about yourself!"
        placeholderTextColor="#666"
        style={{ fontFamily: "NataSans-Regular" }}
        className="bg-[#191F18]
 border border-[#6DA963]
 rounded-xl
 h-[90px]
 px-5
 pt-4
 text-white
 text-[15px]
 font-nata"
      />
    </View>
  );
}