import { useState } from "react";
<<<<<<< HEAD
import { TextInput, View, TouchableOpacity, TextInputProps } from "react-native";
=======
import { TextInput, View, TouchableOpacity } from "react-native";
>>>>>>> b00059593453532204c829d68f38b2c7519ada21
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
<<<<<<< HEAD
  ...rest // This keeps the team's ability to pass extra props automatically
=======
>>>>>>> b00059593453532204c829d68f38b2c7519ada21
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
<<<<<<< HEAD
        className="text-white text-[14px] font-nata outline-none w-full h-full"
        {...rest} // This passes the extra props down
=======
        className="text-white text-[14px] font-nata outline-none flex-1 h-full"
>>>>>>> b00059593453532204c829d68f38b2c7519ada21
      />
      {secureTextEntry !== undefined && (
        <TouchableOpacity onPress={() => setIsSecure(!isSecure)} className="ml-2 p-1">
          <Ionicons name={isSecure ? "eye-off" : "eye"} size={20} color="#5F5F5F" />
        </TouchableOpacity>
      )}
    </View>
  );
}