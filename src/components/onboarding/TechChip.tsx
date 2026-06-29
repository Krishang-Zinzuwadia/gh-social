import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

type TechChipProps = {
  title: string;
  image?: React.ReactNode;
  selected?: boolean;
  onPress?: () => void;
};

export default function TechChip({
  title,
  image,
  selected = false,
  onPress,
}: TechChipProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      className={`rounded-xl px-3 py-2 mr-2 mb-2 flex-row items-center ${
        selected
          ? "bg-[#152418] border border-[#6DA963]"
          : "bg-[#1A1A1A] border border-[#333]"
      }`}
    >
      {image && <View className="mr-2">{image}</View>}
      <Text className="text-white text-sm">
        {title}
      </Text>

      <Text
        className={`ml-2 text-base ${
          selected
            ? "text-[#6DA963]"
            : "text-[#8A8A8A]"
        }`}
      >
        {selected ? "×" : "+"}
      </Text>
    </TouchableOpacity>
  );
}