import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";

import { apiClient } from "@/api/client";
import LogoPlaceholder from "@/components/onboarding/LogoPlaceholder";
import PrimaryButton from "@/components/onboarding/PrimaryButton";
import ProgressBar from "@/components/onboarding/ProgressBar";
import StepHeader from "@/components/onboarding/StepHeader";
import TechChip from "@/components/onboarding/TechChip";
import { INTEREST_CATEGORIES } from "@/constants/onboarding";

export default function Step3() {
  const { categories, techStack, username, dob, bio } = useLocalSearchParams();
  const selectedCategoryIds = typeof categories === "string" ? categories.split(",") : [];
  const techStackArray = typeof techStack === "string" ? techStack.split(",") : [];

  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const toggleInterest = (keyword: string) => {
    setSelectedInterests((prev) =>
      prev.includes(keyword)
        ? prev.filter((k) => k !== keyword)
        : [...prev, keyword]
    );
  };

  const completeOnboarding = async () => {
    if (selectedInterests.length >= 5) {
      setIsLoading(true);
      try {
        // Format date_of_birth from MM/DD/YYYY to YYYY-MM-DD
        let formattedDateOfBirth = undefined;
        if (dob) {
          const dateStr = dob as string;
          // Try to parse MM/DD/YYYY format
          const parts = dateStr.split('/');
          if (parts.length === 3) {
            const [month, day, year] = parts;
            formattedDateOfBirth = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
          } else {
            // Try to parse other formats or use as-is if already YYYY-MM-DD
            formattedDateOfBirth = dateStr;
          }
        }

        const payload = {
          username: username as string || "",
          full_name: username as string || "", // Using username as full_name for now since it's required
          date_of_birth: formattedDateOfBirth,
          bio: (bio as string) || "", // Convert undefined to empty string
          interests: selectedInterests,
          skills: selectedCategoryIds,
          tech_stack: techStackArray,
        };
        
        console.log("Submitting Onboarding Payload:", payload);
        
        const response = await apiClient.setupOnboarding(payload);

        if (response.success) {
          router.replace("/(tabs)/home");
        } else {
          Alert.alert('Error', response.error || 'Failed to complete onboarding');
        }
      } catch (error: any) {
        Alert.alert('Error', error.error || error.message || 'Failed to complete onboarding');
      } finally {
        setIsLoading(false);
      }
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

      {INTEREST_CATEGORIES.filter((c) => selectedCategoryIds.includes(c.id)).map((category) => {
        if (!category.interests || category.interests.length === 0) return null;

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
              {category.interests.map((interest) => (
                <TechChip
                  key={interest.id}
                  title={interest.name}
                  image={interest.icon}
                  selected={selectedInterests.includes(interest.id)}
                  onPress={() => toggleInterest(interest.id)}
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

      {errorMsg ? (
        <Text style={{ color: "#E57373", fontSize: 14, marginTop: 4, textAlign: "center" }}>
          {errorMsg}
        </Text>
      ) : null}

      <View style={{ marginTop: selectedInterests.length < 5 ? 8 : 20 }}>
        <PrimaryButton
          title={isLoading ? "Completing..." : "Finish"}
          onPress={completeOnboarding}
          disabled={selectedInterests.length < 5 || isLoading}
        />
      </View>

    </View>
    </ScrollView>
  );
}
