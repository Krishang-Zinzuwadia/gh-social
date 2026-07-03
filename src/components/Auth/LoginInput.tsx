import { useState } from "react";
import { TextInput, View, TouchableOpacity, TextInputProps } from "react-native";
import { Ionicons } from '@expo/vector-icons';


interface Props extends TextInputProps {
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
  ...rest // This keeps the team's ability to pass extra props automatically
}: Props) {
  const [isSecure, setIsSecure] = useState(secureTextEntry);

  return (
    <View className="h-[60px] border-2 border-[#8EFF7A] rounded-[12px] bg-[#191F18] px-5 flex-row items-center">
      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#5F5F5F"
        secureTextEntry={isSecure}
        value={value}
        onChangeText={onChangeText}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        className="text-white text-[14px] font-nata outline-none w-full h-full"
        {...rest} // This passes the extra props down
      />
      {secureTextEntry !== undefined && (
        <TouchableOpacity onPress={() => setIsSecure(!isSecure)} className="ml-2 p-1">
          <Ionicons name={isSecure ? "eye-off" : "eye"} size={20} color="#5F5F5F" />
        </TouchableOpacity>
      )}
    </View>
  );
}