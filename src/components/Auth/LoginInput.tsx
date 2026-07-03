import { TextInput, TextInputProps, View } from "react-native";

interface Props extends TextInputProps {
  placeholder: string;
  secureTextEntry?: boolean;
}

export default function LoginInput({
  placeholder,
  secureTextEntry,
  ...rest
}: Props) {
  return (
    <View className="h-[60px] border-2 border-[#8EFF7A] rounded-[12px] bg-[#191F18] px-5 justify-center">
      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#5F5F5F"
        secureTextEntry={secureTextEntry}
        className="text-white text-[14px] font-nata outline-none w-full h-full"
        {...rest}
      />
    </View>
  );
}