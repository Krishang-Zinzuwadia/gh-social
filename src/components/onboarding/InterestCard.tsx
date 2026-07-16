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
        backgroundColor: "#181E18",
        borderRadius: 14,
        borderWidth: 1,
        borderColor: selected ? "#8EFF7A" : "#303030",
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
          backgroundColor: "#2A332B",
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
          color: selected ? "#F0F6EB" : "#D0D0D0",
          fontSize: 14,
          fontWeight: "500",
        }}
      >
        {title}
      </Text>

      {selected && (
        <Text
          style={{
            color: "#8EFF7A",
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