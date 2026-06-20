import { router } from "expo-router";
import {
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import PrimaryButton from "@/components/onboarding/PrimaryButton";
import ProgressBar from "@/components/onboarding/ProgressBar";
import SkillCard from "@/components/onboarding/SkillCard";

export default function Step1() {
  return (
    <SafeAreaView className="flex-1 bg-black">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 10,
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
            marginTop: 32,
            marginBottom: 32,
          }}
        >
          <View
            style={{
              width: 140,
              height: 140,
              borderRadius: 70,
              backgroundColor: "#10391D",
            }}
          />
        </View>

        {/* Heading */}
        <View style={{ alignItems: "center" }}>
          <Text
            style={{
              color: "#F0F6EB",
              fontSize: 48,
              fontWeight: "700",
              textAlign: "center",
            }}
          >
            What are your
          </Text>

          <Text
            style={{
              color: "#6DA963",
              fontSize: 48,
              fontWeight: "700",
              textAlign: "center",
              marginBottom: 16,
            }}
          >
            skills?
          </Text>

          <Text
            style={{
              color: "#8A8A8A",
              textAlign: "center",
              fontSize: 18,
              lineHeight: 28,
            }}
          >
            Select the skills you have so we can
          </Text>

          <Text
            style={{
              color: "#8A8A8A",
              textAlign: "center",
              fontSize: 18,
              lineHeight: 28,
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
            marginTop: 48,
            marginBottom: 20,
          }}
        >
          POPULAR SKILLS
        </Text>

        {/* Skills */}
        <View className="flex-row flex-wrap justify-between gap-y-4">
          <SkillCard icon="JS" title="JavaScript" selected />
          <SkillCard icon="TS" title="TypeScript" selected />
          <SkillCard icon="Py" title="Python" selected />
          <SkillCard icon="⚛" title="React" selected />
          <SkillCard icon="☕" title="Java" />
          <SkillCard icon="Go" title="Go" />
        </View>

        {/* Show More */}
        <TouchableOpacity
          style={{
            alignItems: "center",
            marginTop: 24,
          }}
        >
          <Text
            style={{
              color: "#6DA963",
              fontSize: 22,
              fontWeight: "600",
            }}
          >
            + Show more
          </Text>
        </TouchableOpacity>

        {/* Continue */}
        <View style={{ marginTop: 32 }}>
          <PrimaryButton
  title="Continue"
  onPress={() => router.push("/onboarding/step2")}
/>
        </View>

        {/* Skip */}
        <TouchableOpacity
          style={{
            alignItems: "center",
            marginTop: 20,
          }}
        >
          <Text
            style={{
              color: "#8A8A8A",
              fontSize: 18,
            }}
          >
            Skip for now
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}