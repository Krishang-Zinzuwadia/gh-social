import { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { ScrollView, View, Text, Pressable } from "react-native";

import ProgressBar from "@/components/onboarding/ProgressBar";
import PrimaryButton from "@/components/onboarding/PrimaryButton";
import TechChip from "@/components/onboarding/TechChip";
import LogoPlaceholder from "@/components/onboarding/LogoPlaceholder";
import StepHeader from "@/components/onboarding/StepHeader";
import { CATEGORIES, INTERESTS, getTechImage } from "./constants";

export default function Step3() {
  const { categories } = useLocalSearchParams();
  const selectedCategoryIds = typeof categories === "string" ? categories.split(",") : [];

  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const toggleInterest = (keyword: string) => {
    setSelectedInterests((prev) =>
      prev.includes(keyword)
        ? prev.filter((k) => k !== keyword)
        : [...prev, keyword]
    );
  };

  const completeOnboarding = () => {
    if (selectedInterests.length >= 5) {
      router.replace("/(tabs)/home");
    }
  };

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: "#0A0C09",
      }}
      contentContainerStyle={{
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 40,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ maxWidth: 450, width: "100%", alignSelf: "center" }}>
        <Text
        style={{
          color: "#F0F6EB",
          fontSize: 18,
          marginBottom: 12,
        }}
      >
        3 / 3
      </Text>

      <ProgressBar step={3} totalSteps={3} />

      <View
        style={{
          alignItems: "center",
          marginTop: 24,
        }}
      >
        <LogoPlaceholder />
      </View>

      <StepHeader
        titleWhite="What are your"
        titleGreen="interests?"
        description="Tell us what you're passionate about so we can connect you with the right people."
      />

      <Text
        style={{
          color: "#8A8A8A",
          fontSize: 15,
          marginTop: 24,
          marginBottom: 14,
        }}
      >
        CHOOSE YOUR INTERESTS
      </Text>

      {CATEGORIES.filter((c) => selectedCategoryIds.includes(c.id)).map((category) => {
        const categoryInterests = INTERESTS.find(
          (i) => i.categoryId === category.id
        )?.keywords;

        if (!categoryInterests || categoryInterests.length === 0) return null;

        return (
          <View key={category.id} style={{ marginBottom: 24 }}>
            <Text
              style={{
                color: "#F0F6EB",
                fontSize: 16,
                fontWeight: "600",
                marginBottom: 12,
              }}
            >
              {category.title}
            </Text>
            <View className="flex-row flex-wrap">
              {categoryInterests.map((keyword) => (
                <TechChip
                  key={keyword}
                  title={keyword}
                  image={getTechImage(keyword)}
                  selected={selectedInterests.includes(keyword)}
                  onPress={() => toggleInterest(keyword)}
                />
              ))}
            </View>
          </View>
        );
      })}

      {selectedInterests.length < 5 && (
        <Text style={{ color: "#E57373", fontSize: 14, marginTop: 4, textAlign: "center" }}>
          Select at least 5 interests.
        </Text>
      )}

      <View style={{ marginTop: selectedInterests.length < 5 ? 8 : 20 }}>
        <PrimaryButton
          title="Finish"
          onPress={completeOnboarding}
          disabled={selectedInterests.length < 5}
        />
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={completeOnboarding}
        style={{ marginTop: 12, paddingVertical: 8 }}
      >
        <Text
          style={{
            color: "#8A8A8A",
            textAlign: "center",
            fontSize: 15,
          }}
        >
          Skip for now
        </Text>
      </Pressable>
    </View>
    </ScrollView>
  );
}
