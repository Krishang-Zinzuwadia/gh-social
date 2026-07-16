import { ReactNode } from "react";
import {
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from "react-native";
import { ChevronRightIcon } from "./icons";

interface SocialButtonProps extends TouchableOpacityProps {
  label: string;
  icon: ReactNode;
  showChevron?: boolean;
  variant?: "primary" | "secondary";
}

export default function SocialButton({
  label,
  icon,
  showChevron = false,
  variant = "secondary",
  disabled = false,
  style,
  ...props
}: SocialButtonProps) {
  const isPrimary = variant === "primary";

  return (
    <TouchableOpacity
      className="flex-row items-center border-2 rounded-[9px] h-[61px] px-4"
      disabled={disabled}
      style={[
        {
          backgroundColor: isPrimary && !disabled ? "#FFFFFF" : "#1C1C1E",
          borderColor: isPrimary && !disabled ? "transparent" : "rgba(255,255,255,0.14)",
        },
        style,
      ]}
      activeOpacity={0.75}
      {...props}
    >
      <View className="w-8 items-center">
        {icon}
      </View>

      <Text
        className="flex-1 ml-3 text-[16px] font-nata"
        style={{
          color: disabled
            ? "rgba(235,235,245,0.35)"
            : isPrimary
              ? "#000000"
              : "#FFFFFF",
        }}
      >
        {label}
      </Text>

      {showChevron && (
        <ChevronRightIcon
          size={20}
          color={
            disabled
              ? "rgba(235,235,245,0.35)"
              : isPrimary
                ? "#000000"
                : "#63E08A"
          }
        />
      )}
    </TouchableOpacity>
  );
}
