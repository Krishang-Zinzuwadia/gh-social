import { TextInput, View } from "react-native";

interface Props {
  placeholder: string;
  secureTextEntry?: boolean;
  value?: string;
  onChangeText?: (text: string) => void;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
}

export default function LoginInput({
  placeholder,
  secureTextEntry,
  value,
  onChangeText,
  autoCapitalize,
  keyboardType,
}: Props) {
  return (
    <View className="h-[60px] border-2 border-[#8EFF7A] rounded-[12px] bg-[#191F18] px-5 justify-center">
      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#5F5F5F"
        secureTextEntry={secureTextEntry}
        value={value}
        onChangeText={onChangeText}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        className="text-white text-[14px] font-nata outline-none w-full h-full"
      />
    </View>
  );
}