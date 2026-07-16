import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

type Props = {
  title: string;
  image: React.ReactNode;
  selected?: boolean;
  onPress?: () => void;
};

export default function InterestCard({
  title,
  image,
  selected = false,
  onPress,
}: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        width: "48.5%",
        minHeight: 78,
        backgroundColor: "#1C1C1E",
        borderRadius: 14,
        borderWidth: 1,
        borderColor: selected ? "#63E08A" : "rgba(255,255,255,0.14)",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 14,
        marginBottom: 14,
      }}
    >
      <View
        style={{
          width: 38,
          height: 38,
          borderRadius: 12,
          backgroundColor: "#2C2C2E",
          justifyContent: "center",
          alignItems: "center",
          marginRight: 10,
        }}
      >
        {image}
      </View>

      <Text
        numberOfLines={2}
        style={{
          flex: 1,
          color: selected ? "#FFFFFF" : "rgba(235,235,245,0.75)",
          fontSize: 14,
          fontWeight: "500",
        }}
      >
        {title}
      </Text>

      {selected && (
        <Text
          style={{
            color: "#63E08A",
            fontSize: 22,
            fontWeight: "700",
          }}
        >
          ✓
        </Text>
      )}
    </TouchableOpacity>
  );
}
