import { useState } from "react";
import { TextInput, View, TextInputProps, TouchableOpacity } from "react-native";
import { UserIcon, MailIcon, EyeIcon as CustomEyeIcon } from "./icons";
import { Ionicons } from '@expo/vector-icons';

interface Props extends TextInputProps {
  placeholder: string;
  secureTextEntry?: boolean;
  icon?: string;
}

export default function AuthInput({
  placeholder,
  secureTextEntry,
  icon,
  ...rest
}: Props) {
  const [isSecure, setIsSecure] = useState(secureTextEntry);

  return (
    <View className="h-[46px] border border-[#8EFF7A] rounded-xl bg-[#191F18] px-4 flex-row items-center">
      {icon === "user" && <View className="mr-3"><UserIcon /></View>}
      {icon === "mail" && <View className="mr-3"><MailIcon /></View>}
      {icon === "eye" && <View className="mr-3"><CustomEyeIcon /></View>}
      
      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#727272"
        secureTextEntry={isSecure}
        className="font-nata text-white text-[13px] outline-none flex-1 h-full"
        {...rest}
      />

      {secureTextEntry !== undefined && (
        <TouchableOpacity onPress={() => setIsSecure(!isSecure)} className="ml-2 p-1">
          <Ionicons name={isSecure ? "eye-off" : "eye"} size={20} color="#727272" />
        </TouchableOpacity>
      )}
    </View>
  );
}