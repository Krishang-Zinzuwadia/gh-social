import { router } from "expo-router";
import {
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import PrimaryButton from "@/components/onboarding/PrimaryButton";
import ProgressBar from "@/components/onboarding/ProgressBar";
import TechChip from "@/components/onboarding/TechChip";

export default function Step2() {
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
          2 / 3
        </Text>

        <ProgressBar
          step={2}
          totalSteps={3}
        />

        {/* Logo */}
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
              fontSize: 42,
              fontWeight: "700",
              textAlign: "center",
            }}
          >
            What tech stack
          </Text>

          <Text
            style={{
              color: "#6DA963",
              fontSize: 42,
              fontWeight: "700",
              textAlign: "center",
            }}
          >
            do you use?
          </Text>

          <Text
            style={{
              color: "#8A8A8A",
              textAlign: "center",
              fontSize: 18,
              marginTop: 12,
            }}
          >
            Add the technologies you work with
          </Text>

          <Text
            style={{
              color: "#8A8A8A",
              textAlign: "center",
              fontSize: 18,
            }}
          >
            or want to explore.
          </Text>
        </View>

        {/* Search */}
        <View style={{ marginTop: 28 }}>
          <TextInput
            placeholder="Search technologies"
            placeholderTextColor="#777"
            style={{
              backgroundColor: "#151515",
              borderWidth: 1,
              borderColor: "#6DA963",
              borderRadius: 12,
              padding: 16,
              color: "white",
            }}
          />
        </View>

        {/* Selected */}
        <Text
          style={{
            color: "#AAAAAA",
            fontSize: 18,
            marginTop: 28,
            marginBottom: 16,
          }}
        >
          Your Selection
        </Text>

        <View className="flex-row flex-wrap">
          <TechChip title="React" selected />
          <TechChip title="MongoDB" selected />
          <TechChip title="Node.js" selected />
          <TechChip title="Tailwind CSS" selected />
          <TechChip title="PostgreSQL" selected />
        </View>

        {/* Suggested */}
        <Text
          style={{
            color: "#AAAAAA",
            fontSize: 18,
            marginTop: 10,
            marginBottom: 16,
          }}
        >
          Suggested for you
        </Text>

        <View className="flex-row flex-wrap">
          <TechChip title="Next.js" />
          <TechChip title="TypeScript" />
          <TechChip title="GraphQL" />
          <TechChip title="Docker" />
          <TechChip title="Prisma" />
          <TechChip title="AWS" />
        </View>

        <View style={{ marginTop: 32 }}>
          <PrimaryButton
  title="Continue"
  onPress={() => router.push("/onboarding/step3")}
/>
        </View>

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