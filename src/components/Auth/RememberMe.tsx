import { Text, View } from "react-native";
import ForgotPassword from "./ForgotPassword";

export default function RememberMe() {
  return (
    <View className="flex-row justify-between items-center mt-5">
      <View className="flex-row items-center">
        <View className="w-4 h-4 border border-[#6DA963] rounded-[3px]" />

        <Text
          style={{ fontFamily: "NataSans-Regular" }}
          className="text-[#8A8A8A] text-[13px] ml-3 font-nata"
        >
          Remember me
        </Text>
      </View>

      <ForgotPassword
        onPress={() => {
          // router.push("/forgot-password")
        }}
      />
    </View>
  );
}