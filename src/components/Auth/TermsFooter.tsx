import { View, Text } from "react-native";

export default function TermsFooter() {
  return (
    <View className="items-center mt-10">
      <Text
        className="text-[rgba(235,235,245,0.3)] text-xs text-center font-nata"
      >
        By signing up, you agree to our
      </Text>

      <Text
        className="text-[#63E08A] text-xs mt-1 font-nata"
      >
        Terms of Service and Privacy Policy.
      </Text>
    </View>
  );
}
