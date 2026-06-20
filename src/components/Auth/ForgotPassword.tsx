import { Text, TouchableOpacity, TouchableOpacityProps } from "react-native";

export default function ForgotPassword(
  props: TouchableOpacityProps
) {
  return (
    <TouchableOpacity activeOpacity={0.7} {...props}>
      <Text
        style={{ fontFamily: "NataSans-Regular" }}
        className="text-[#6DA963] text-[13px] font-nata"
      >
        Forgot password?
      </Text>
    </TouchableOpacity>
  );
}