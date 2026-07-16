import { View, Text, TextInput, TextInputProps } from "react-native";

interface Props extends TextInputProps {
  value?: string;
  onChangeText?: (text: string) => void;
}

export default function ProfileTextArea({ value, onChangeText, ...rest }: Props) {
  return (
    <View>
      <Text
        className="text-white text-[15px] mb-3 font-nata"
      >
        Bio (optional)
      </Text>

      <TextInput
        multiline
        numberOfLines={2}
        textAlignVertical="top"
        placeholder="Tell us about yourself!"
        placeholderTextColor="#666"
        value={value}
        onChangeText={onChangeText}
        className="bg-[#191F18]
 border border-[#8EFF7A]
 rounded-xl
 h-[90px]
 px-5
 pt-4
 text-white
 text-[15px]
 font-nata outline-none"
        {...rest}
      />
    </View>
  );
}
