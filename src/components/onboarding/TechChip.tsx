import { Text, TouchableOpacity } from "react-native";

type TechChipProps = {
  title: string;
  selected?: boolean;
};

export default function TechChip({
  title,
  selected = false,
}: TechChipProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      className={`rounded-xl px-4 py-3 mr-3 mb-3 flex-row items-center ${
        selected
          ? "bg-[#152418] border border-[#6DA963]"
          : "bg-[#1A1A1A] border border-[#333]"
      }`}
    >
      <Text className="text-white text-base">
        {title}
      </Text>

      <Text
        className={`ml-2 text-lg ${
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