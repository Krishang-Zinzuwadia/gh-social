import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
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

import { SUGGESTED_TECHS, getTechIcon } from "@/constants/onboarding";

const PREDEFINED_TECHS = SUGGESTED_TECHS.map(t => t.name);

export default function Step2() {
  const { categories, username, dob, bio } = useLocalSearchParams();
  
  const [selectedTechs, setSelectedTechs] = useState<string[]>([
    "React",
    "MongoDB",
    "Node.js",
    "Tailwind CSS",
    "PostgreSQL",
  ]);
  const [customTechs, setCustomTechs] = useState<string[]>([]);
  const [inputText, setInputText] = useState("");

  const handleAddTech = () => {
    const tech = inputText.trim();
    if (!tech) return;

    const allKnownTechs = [...PREDEFINED_TECHS, ...customTechs];
    const existing = allKnownTechs.find((t) => t.toLowerCase() === tech.toLowerCase());

    if (existing) {
      if (!selectedTechs.includes(existing)) {
        setSelectedTechs([...selectedTechs, existing]);
      }
    } else {
      setCustomTechs([...customTechs, tech]);
      setSelectedTechs([...selectedTechs, tech]);
    }
    setInputText("");
  };

  const toggleTech = (tech: string) => {
    setSelectedTechs((prev) =>
      prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]
    );
  };

  const handleContinue = () => {
    updateData({ tech_stack: selectedTechs });
    router.push({
      pathname: "/onboarding/step3",
      params: { categories },
    });
  };

  const suggestedTechs = [...PREDEFINED_TECHS, ...customTechs].filter(
    (t) => !selectedTechs.includes(t)
  );

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
        <View style={{ maxWidth: 450, width: "100%", alignSelf: "center" }}>
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

        <ProgressBar step={2} totalSteps={3} />

        {/* Logo */}
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
            What tech stack
          </Text>

          <Text
            style={{
              color: "#8EFF7A",
              fontSize: 40,
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
              fontSize: 15,
              marginTop: 8,
            }}
          >
            Add the technologies you work with
          </Text>

          <Text
            style={{
              color: "#8A8A8A",
              textAlign: "center",
              fontSize: 15,
            }}
          >
            or want to explore.
          </Text>
        </View>

        {/* Custom Tech Input */}
        <View
          style={{
            marginTop: 16,
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#151515",
            borderWidth: 1,
            borderColor: "#6DA963",
            borderRadius: 12,
            paddingHorizontal: 14,
          }}
        >
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleAddTech}
            placeholder="Add your own tech stack"
            placeholderTextColor="#777"
            style={{
              flex: 1,
              paddingVertical: 14,
              paddingHorizontal: 8,
              color: "white",
            }}
          />
          <TouchableOpacity onPress={handleAddTech} style={{ padding: 8 }}>
            <Text style={{ color: "#6DA963", fontSize: 24, fontWeight: "500" }}>
              +
            </Text>
          </TouchableOpacity>
        </View>

        {/* Selected */}
        {selectedTechs.length > 0 && (
          <>
            <Text
              style={{
                color: "#AAAAAA",
                fontSize: 16,
                marginTop: 16,
                marginBottom: 10,
              }}
            >
              Your Selection
            </Text>

            <View className="flex-row flex-wrap">
              {selectedTechs.map((tech) => (
                <TechChip
                  key={tech}
                  title={tech}
                  image={getTechIcon(tech)}
                  selected
                  onPress={() => toggleTech(tech)}
                />
              ))}
            </View>
          </>
        )}

        {/* Suggested */}
        {suggestedTechs.length > 0 && (
          <>
            <Text
              style={{
                color: "#AAAAAA",
                fontSize: 16,
                marginTop: 10,
                marginBottom: 10,
              }}
            >
              Suggested for you
            </Text>

            <View className="flex-row flex-wrap">
              {suggestedTechs.map((tech) => (
                <TechChip
                  key={tech}
                  title={tech}
                  image={getTechIcon(tech)}
                  selected={false}
                  onPress={() => toggleTech(tech)}
                />
              ))}
            </View>
          </>
        )}

        <View style={{ marginTop: 16 }}>
          <PrimaryButton
            title="Continue"
            onPress={() =>
              router.push({
                pathname: "/onboarding/step3",
                params: { 
                  categories,
                  techStack: selectedTechs.join(","),
                  username,
                  dob,
                  bio,
                }
              })
            }
          />
        </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
