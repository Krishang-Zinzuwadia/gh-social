import React, { useEffect, useMemo } from "react";
import { Text, TouchableOpacity, View, Animated } from "react-native";
import { Check } from "lucide-react-native";

type SkillCardProps = {
  title: string;
  image: React.ReactNode;
  selected?: boolean;
  onPress?: () => void;
};

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export default function SkillCard({
  title,
  image,
  selected = false,
  onPress,
}: SkillCardProps) {
  const scale = useMemo(() => new Animated.Value(1), []);
  const opacity = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scale, {
        toValue: selected ? 1.02 : 1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: selected ? 1 : 0,
        duration: 150,
        useNativeDriver: true,
      })
    ]).start();
  }, [selected, scale, opacity]);

  return (
    <AnimatedTouchableOpacity
      activeOpacity={0.8}
      onPress={onPress ?? (() => {})}
      style={{
        width: "48%",
        backgroundColor: selected ? "#2C2C2E" : "#1C1C1E",
        borderColor: selected ? "#63E08A" : "rgba(255,255,255,0.14)",
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
        transform: [{ scale }],
        shadowColor: selected ? "#63E08A" : "transparent",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: selected ? 0.4 : 0,
        shadowRadius: 8,
        elevation: selected ? 4 : 0,
      }}
    >
      <View
        style={{
          width: 24,
          height: 24,
          justifyContent: "center",
          alignItems: "center",
          marginRight: 8,
        }}
      >
        <Animated.View style={{ opacity: Animated.subtract(1, opacity) }}>
          {image}
        </Animated.View>
        
        <Animated.View
          style={{
            position: "absolute",
            width: 22,
            height: 22,
            borderRadius: 11,
            backgroundColor: "#63E08A",
            justifyContent: "center",
            alignItems: "center",
            opacity,
            transform: [
              { scale: opacity.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }) }
            ],
            shadowColor: "#000000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 3,
            elevation: 3,
          }}
        >
          <Check size={14} color="#FFFFFF" strokeWidth={3} />
        </Animated.View>
      </View>

      <Text
        numberOfLines={1}
        style={{
          flex: 1,
          color: "#FFFFFF",
          fontSize: 12,
          lineHeight: 18,
        }}
      >
        {title}
      </Text>
    </AnimatedTouchableOpacity>
  );
}
