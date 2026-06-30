import { Text, TouchableOpacity, TouchableOpacityProps } from "react-native";

export default function ForgotPassword(
  props: TouchableOpacityProps
) {
  return (
    <TouchableOpacity activeOpacity={0.7} {...props}>
      <Text
        className="text-[#8EFF7A] text-[13px] font-nata"
      >
        Forgot password?
      </Text>
    </TouchableOpacity>
  );
}