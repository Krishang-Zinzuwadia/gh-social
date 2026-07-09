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

  const isValidDate = (dateString: string) => {
    // Regex for YYYY-MM-DD format
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;
    // Check if it's an actual calendar date
    const d = new Date(dateString);
    const dNum = d.getTime();
    if (!dNum && dNum !== 0) return false; 
    return d.toISOString().slice(0, 10) === dateString;
  };

  const isDobValid = dob.trim().length === 0 || isValidDate(dob.trim());
  const isFormValid = username.trim().length > 0 && dob.trim().length > 0 && isDobValid;

  const handleCreateAccount = () => {
    if (isFormValid) {
      updateData({ 
        username, 
        date_of_birth: dob,
        bio,
        full_name: user?.full_name || "New User" // We can grab this from auth or prompt
      });
      router.push("/onboarding/step1");
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-[#0A0C09]"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 50 }}
    >
      <View className="px-8 pt-14 w-full" style={{ maxWidth: 450, alignSelf: 'center' }}>

        {/* Avatar */}
        <ProfileAvatar />

        {/* Heading */}
        <View className="items-center mt-4">
          <Text
            
            className="text-white text-[32px] text-center font-nataBold"
          >
            Create your{" "}
            <Text className="text-[#8EFF7A] font-nataBold">
              Weave account
            </Text>
          </Text>

          <Text
            
            className="text-[#8A8A8A] text-[14px] text-center mt-3 font-nata"
          >
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
          {dob.trim().length > 0 && !isDobValid && (
            <Text className="text-[#E57373] text-[13px] font-nata mt-1 ml-1">
              Please enter a valid date in YYYY-MM-DD format.
            </Text>
          )}
        </View>

        {/* Bio */}
        <View className="mt-4">
            <ProfileTextArea value={bio} onChangeText={setBio} />
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
