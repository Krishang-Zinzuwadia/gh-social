import { TextInput, View } from "react-native";

interface Props {
  placeholder: string;
  secureTextEntry?: boolean;
  icon?: string;
}

export default function AuthInput({
  placeholder,
  secureTextEntry,
}: Props) {
  return (
    <View className="h-[46px] border border-[#6DA963] rounded-xl bg-[#191F18] px-4 justify-center">
      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#727272"
        secureTextEntry={secureTextEntry}
        className="font-nata text-white text-[13px]"
      />
    </View>
  );
}