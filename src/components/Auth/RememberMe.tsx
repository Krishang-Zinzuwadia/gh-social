import { useState } from "react";
import { Text, View, TouchableOpacity } from "react-native";
import Svg, { Path } from "react-native-svg";

export default function RememberMe() {
  const [isChecked, setIsChecked] = useState(false);

  return (
    <View className="flex-row justify-between items-center mt-5">
      <TouchableOpacity 
        activeOpacity={0.7} 
        onPress={() => setIsChecked(!isChecked)}
        className="flex-row items-center"
      >
        <View
          className={`w-4 h-4 border rounded-[3px] justify-center items-center ${
            isChecked
              ? "border-[#63E08A] bg-[#63E08A]"
              : "border-[rgba(255,255,255,0.14)] bg-transparent"
          }`}
        >
          {isChecked && (
            <Svg width="10" height="10" viewBox="0 0 24 24" fill="none">
              <Path d="M20 6L9 17l-5-5" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          )}
        </View>

        <Text
          className="text-[rgba(235,235,245,0.6)] text-[13px] ml-3 font-nata"
        >
          Remember me
        </Text>
      </TouchableOpacity>
    </View>
  );
}
