import {
    Text,
    TouchableOpacity,
} from "react-native";

type PrimaryButtonProps = {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
};

export default function PrimaryButton({
  title,
  onPress,
  disabled = false,
}: PrimaryButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={{ opacity: disabled ? 0.5 : 1 }}
      className="
        bg-[#449138]
        rounded-[18px]
        py-4
        items-center
      "
    >
      <Text
  className="text-lg font-bold"
  style={{
    color: "#F0F6EB",
  }}
    >
        {title}
      </Text>
    </TouchableOpacity>
  );
}