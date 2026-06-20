import { useRouter } from "expo-router";
import {
    ScrollView,
    Text,
    View,
} from "react-native";

import AuthFooter from "@/components/Auth/AuthFooter";
import AuthInput from "@/components/Auth/AuthInput";
import EmailTab from "@/components/Auth/EmailTab";
import { GithubIcon, GoogleIcon } from "@/components/Auth/icons";
import LogoCircle from "@/components/Auth/LogoCircle";
import OrDivider from "@/components/Auth/OrDivider";
import PasswordRules from "@/components/Auth/PasswordRules";
import PrimaryButton from "@/components/Auth/PrimaryButton";
import SectionLabel from "@/components/Auth/SectionLabel";
import SocialButton from "@/components/Auth/SocialButton";

export default function SignUpEmail() {
  const router = useRouter();  
  return (
    <ScrollView
      className="flex-1 bg-[#0A0C09]"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <View className="px-8 pt-14">

        <View className="items-center">
            <LogoCircle />
        </View>

        <View className="mt-8 items-center">
          <Text className="font-nataBold text-white text-[28px] text-center">
            Create your
          </Text>

          <Text className="font-nataBold text-[#6DA963] text-[28px] text-center">
            developer profile
          </Text>

          <Text className="font-nata text-[#8A8A8A] text-center mt-4 text-[13px] leading-5">
            Join repositories and connect{"\n"}
            with developers around the world.
          </Text>
        </View>

        <View className="mt-10 gap-y-5">
            <SocialButton
                label="Continue with GitHub"
                icon={<GithubIcon />}
                showChevron
            />

            <SocialButton
                label="Continue with Google"
                icon={<GoogleIcon />}
                showChevron
            />
        </View>

        <View className="mt-7">
          <OrDivider />
        </View>

        <View className="mt-6">
          <EmailTab />
        </View>

        <View className="mt-8">

          <SectionLabel title="Full name" />
          <AuthInput
            placeholder="Enter your full name"
            icon="user"
          />

          <SectionLabel title="Email Address" />
          <AuthInput
            placeholder="Enter your email"
            icon="mail"
          />

          <SectionLabel title="Password" />
          <AuthInput
            placeholder="Create a password"
            icon="eye"
            secureTextEntry
          />

          <PasswordRules />

          <View className="mt-10">
            <PrimaryButton
                label="Create Account"
                onPress={() => router.push("/create-profile")}
            />
          </View>

        </View>

        <AuthFooter
            prompt="Already have an account?"
            linkLabel="Log In"
            onPress={() => router.push("/login")}
/>

      </View>
    </ScrollView>
  );
}