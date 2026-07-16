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
    <View className="h-[60px] border-2 border-[rgba(255,255,255,0.14)] rounded-[12px] bg-[#1C1C1E] px-5 justify-center">
      <TextInput
        placeholder={placeholder}
        placeholderTextColor="rgba(235,235,245,0.3)"
        secureTextEntry={secureTextEntry}
        className="text-white text-[14px] font-nata outline-none w-full h-full"
        {...rest}
      />
    </View>
  );
}
