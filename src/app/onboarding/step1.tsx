import { useState } from "react";
import { router } from "expo-router";
import {
    ScrollView,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import PrimaryButton from "@/components/onboarding/PrimaryButton";
import ProgressBar from "@/components/onboarding/ProgressBar";
import SkillCard from "@/components/onboarding/SkillCard";
import { CATEGORIES } from "./constants";

export default function Step1() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleContinue = () => {
    if (selectedCategories.length >= 2) {
      router.push({
        pathname: "/onboarding/step2",
        params: { categories: selectedCategories.join(",") }
      });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: 40,
        }}
      >
        {/* Step */}
        <Text
          style={{
            color: "#F0F6EB",
            fontSize: 18,
            marginBottom: 12,
          }}
        >
          1 / 3
        </Text>

        <ProgressBar
          step={1}
          totalSteps={3}
        />

        {/* Logo Placeholder */}
        <View
          style={{
            alignItems: "center",
            marginTop: 24,
            marginBottom: 24,
          }}
        >
          <View
            style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              backgroundColor: "#10391D",
            }}
          />
        </View>

        {/* Heading */}
        <View style={{ alignItems: "center" }}>
          <Text
            style={{
              color: "#F0F6EB",
              fontSize: 40,
              fontWeight: "700",
              textAlign: "center",
            }}
          >
            What are your
          </Text>

          <Text
            style={{
              color: "#6DA963",
              fontSize: 38,
              fontWeight: "700",
              textAlign: "center",
              marginBottom: 10,
            }}
          >
            skills?
          </Text>

          <Text
            style={{
              color: "#8A8A8A",
              textAlign: "center",
              fontSize: 15,
              lineHeight: 22,
            }}
          >
            Select the skills you have so we can
          </Text>

          <Text
            style={{
              color: "#8A8A8A",
              textAlign: "center",
              fontSize: 15,
              lineHeight: 22,
            }}
          >
            personalize your experience.
          </Text>
        </View>

        {/* Section Title */}
        <Text
          style={{
            color: "#8A8A8A",
            fontSize: 13,
            letterSpacing: 1,
            marginTop: 28,
            marginBottom: 14,
          }}
        >
          CATEGORIES
        </Text>

        {/* Skills */}
        <View className="flex-row flex-wrap justify-between gap-y-4">
          {CATEGORIES.map((category) => (
            <SkillCard
              key={category.id}
              image={category.image}
              title={category.title}
              selected={selectedCategories.includes(category.id)}
              onPress={() => toggleCategory(category.id)}
            />
          ))}
        </View>

        {selectedCategories.length < 2 && (
          <Text style={{ color: "#E57373", fontSize: 14, marginTop: 16, textAlign: "center" }}>
            Select at least 2 categories.
          </Text>
        )}

        {/* Continue */}
        <View style={{ marginTop: selectedCategories.length < 2 ? 8 : 24 }}>
          <PrimaryButton
            title="Continue"
            onPress={handleContinue}
            disabled={selectedCategories.length < 2}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
