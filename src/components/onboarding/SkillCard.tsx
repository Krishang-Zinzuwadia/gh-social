import { Text, TouchableOpacity, View } from "react-native";

type SkillCardProps = {
  title: string;
  icon: string;
  selected?: boolean;
  onPress?: () => void;
};

export default function SkillCard({
  title,
  icon,
  selected = false,
  onPress,
}: SkillCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress ?? (() => {})}
      style={{
        width: "48%",
        backgroundColor: "#191F18",
        borderColor: selected ? "#6DA963" : "#555252",
        borderWidth: 1,
        borderRadius: 14,
        paddingHorizontal: 12,
        paddingVertical: 12,
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
      }}
    >
      <View
        style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          backgroundColor: "#2A332B",
          justifyContent: "center",
          alignItems: "center",
          marginRight: 8,
        }}
      >
        <Text
          style={{
            color: "#F0F6EB",
            fontWeight: "600",
            fontSize: 12,
          }}
        >
          {icon}
        </Text>
      </View>

      <Text
        numberOfLines={1}
        style={{
          flex: 1,
          color: "#F0F6EB",
          fontSize: 13,
        }}
      >
        {title}
      </Text>

      {selected && (
        <Text
          style={{
            color: "#6DA963",
            fontSize: 18,
            fontWeight: "700",
          }}
        >
          ✓
        </Text>
      )}
    </TouchableOpacity>
  );
}