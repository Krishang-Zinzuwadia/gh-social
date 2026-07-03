import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useOnboarding } from "../../store/OnboardingContext";
import { useAuth } from "../../store/AuthContext";

import PrimaryButton from "@/components/Auth/PrimaryButton";
import ProfileAvatar from "@/components/Auth/ProfileAvatar";
import ProfileDateInput from "@/components/Auth/ProfileDateInput";
import ProfileInput from "@/components/Auth/ProfileInput";
import ProfileTextArea from "@/components/Auth/ProfileTextArea";
import TermsFooter from "@/components/Auth/TermsFooter";
import UsernameStatus from "@/components/Auth/UsernameStatus";

export default function CreateProfile() {
  const router = useRouter();
  const { updateData } = useOnboarding();
  const { user } = useAuth();
  
  const [username, setUsername] = useState(user?.username || "");
  const [dob, setDob] = useState("");
  const [bio, setBio] = useState("");

<<<<<<< HEAD:src/app/onboarding/create-profile.tsx
// Regex for MM/DD/YYYY format
  const dobRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/;
  
  // Validation logic
  const isDobValid = dob.trim().length === 0 || dobRegex.test(dob.trim());
  const isFormValid = username.trim().length > 0 && dob.trim().length > 0 && isDobValid;
=======
  const dobRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
  const isDobValid = dobRegex.test(dob.trim());
  const isFormValid = username.trim().length > 0 && isDobValid;
>>>>>>> b00059593453532204c829d68f38b2c7519ada21:src/app/(auth)/create-profile.tsx

const handleCreateAccount = () => {
    if (isFormValid) {
      router.push({
        pathname: "/onboarding/step1",
        params: {
          username: username.trim(),
          dob: dob.trim(),
          bio: bio.trim(),
        },
      });
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-[#0A0C09]"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 50 }}
    >
      <View
        className="px-8 pt-14 w-full"
        style={{ maxWidth: 450, alignSelf: "center" }}
      >
        {/* Avatar */}
        <ProfileAvatar />

        {/* Heading */}
        <View className="items-center mt-4">
          <Text className="text-white text-[32px] text-center font-nataBold">
            Create{" "}
            <Text className="text-[#8EFF7A] font-nataBold">your account</Text>
          </Text>

          <Text className="text-[#8A8A8A] text-[14px] text-center mt-3 font-nata">
            Let&apos;s set up your profile.
          </Text>
        </View>

        {/* Username */}
        <View className="mt-8">
          <ProfileInput
            title="Username"
            placeholder="Choose a username"
            value={username}
            onChangeText={setUsername}
          />

          {username.trim().length > 0 && <UsernameStatus />}
        </View>

        {/* Date of birth */}
        <View className="mt-4">
          <ProfileDateInput value={dob} onChangeText={setDob} />
<<<<<<< HEAD:src/app/onboarding/create-profile.tsx
        {dob.trim().length > 0 && !isDobValid && (
            <Text className="text-[#E57373] text-[13px] font-nata mt-1 ml-1">
              Please enter a valid date (mm/dd/yyyy)
=======
          {!isDobValid && (
            <Text className="text-[#E57373] text-[13px] font-nata mt-1 ml-1">
              Please enter a valid date (dd/mm/yyyy)
>>>>>>> b00059593453532204c829d68f38b2c7519ada21:src/app/(auth)/create-profile.tsx
            </Text>
          )}
        </View>

        {/* Bio */}
        <View className="mt-4">
<<<<<<< HEAD:src/app/onboarding/create-profile.tsx
            <ProfileTextArea value={bio} onChangeText={setBio} />
=======
          <ProfileTextArea />
>>>>>>> b00059593453532204c829d68f38b2c7519ada21:src/app/(auth)/create-profile.tsx
        </View>

        {/* Create Account */}
        <View className="mt-8">
          <PrimaryButton
            label="Create Account"
            onPress={handleCreateAccount}
            style={{ opacity: isFormValid ? 1 : 0.5 }}
            disabled={!isFormValid}
          />
        </View>

        {/* Terms */}
        <TermsFooter />
      </View>
    </ScrollView>
  );
}
