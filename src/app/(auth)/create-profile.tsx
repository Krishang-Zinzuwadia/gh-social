import { ScrollView, Text, View } from "react-native";

import PrimaryButton from "@/components/Auth/PrimaryButton";
import ProfileAvatar from "@/components/Auth/ProfileAvatar";
import ProfileDateInput from "@/components/Auth/ProfileDateInput";
import ProfileInput from "@/components/Auth/ProfileInput";
import ProfileTextArea from "@/components/Auth/ProfileTextArea";
import TermsFooter from "@/components/Auth/TermsFooter";
import UsernameStatus from "@/components/Auth/UsernameStatus";

export default function CreateProfile() {
  return (
    <ScrollView
      className="flex-1 bg-[#0A0C09]"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 50 }}
    >
      <View className="px-8 pt-14">

        {/* Avatar */}
        <ProfileAvatar />

        {/* Heading */}
        <View className="items-center mt-8">
          <Text
            
            className="text-white text-[32px] text-center font-nataBold"
          >
            Create{" "}
            <Text className="text-[#6DA963] font-nata">
              your account
            </Text>
          </Text>

          <Text
            
            className="text-[#8A8A8A] text-[14px] text-center mt-3 font-nata"
          >
            Let's set up your profile.
          </Text>
        </View>

        {/* Username */}
        <View className="mt-12">
          <ProfileInput
            title="Username"
            placeholder="Choose a username"
          />

          <UsernameStatus />
        </View>

        {/* Date of birth */}
        <View className="mt-8">
          <ProfileDateInput />
        </View>

        {/* GitHub URL */}
        <View className="mt-8">
          <ProfileInput
            title="GitHub URL (Optional)"
            placeholder="https://github.com/username"
          />
        </View>

        {/* Bio */}
        <View className="mt-8">
            <ProfileTextArea />
        </View>

        {/* Create Account */}
        <View className="mt-12">
          <PrimaryButton label="Create Account" />
        </View>

        {/* Terms */}
        <TermsFooter />

      </View>
    </ScrollView>
  );
}