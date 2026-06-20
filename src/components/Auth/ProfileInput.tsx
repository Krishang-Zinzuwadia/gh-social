import { View, Text, TextInput } from "react-native";

interface Props {
  title: string;
  placeholder: string;
}

export default function ProfileInput({
  title,
  placeholder,
}: Props) {
  return (
    <View className="mt-8">
      <Text
        style={{ fontFamily: "NataSans-Regular" }}
        className="text-white text-[15px] mb-3 font-nata"
      >
        {title}
      </Text>

      <View
        className="h-[56px]
        bg-[#191F18]
        border border-[#6DA963]
        rounded-xl
        px-5
        justify-center"
      >
        <TextInput
          placeholder={placeholder}
          placeholderTextColor="#666"
          style={{ fontFamily: "NataSans-Regular" }}
          className="text-white text-[15px] font-nata"
        />
      </View>
    </View>
  );
}