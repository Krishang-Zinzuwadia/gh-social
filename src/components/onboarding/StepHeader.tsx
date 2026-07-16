import { View, Text } from "react-native";

type Props = {
  titleWhite: string;
  titleGreen: string;
  description: string;
};

export default function StepHeader({
  titleWhite,
  titleGreen,
  description,
}: Props) {
  return (
    <View
      style={{
        alignItems: "center",
        marginTop: 28,
      }}
    >
      <Text
        style={{
          color: "#FFFFFF",
          fontSize: 32,
          fontWeight: "700",
          textAlign: "center",
        }}
      >
        {titleWhite}
      </Text>

      <Text
        style={{
          color: "#63E08A",
          fontSize: 32,
          fontWeight: "700",
          textAlign: "center",
        }}
      >
        {titleGreen}
      </Text>

      <Text
        style={{
          color: "rgba(235,235,245,0.6)",
          fontSize: 15,
          textAlign: "center",
          marginTop: 16,
          lineHeight: 22,
          paddingHorizontal: 24,
        }}
      >
        {description}
      </Text>
    </View>
  );
}
