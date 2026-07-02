import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useRef, useState } from "react";
import { Alert, Platform, ScrollView, Text, View } from "react-native";

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
import { useAuthStore } from "@/store/authStore";

export default function SignUpEmail() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const { signup, oauthLogin, isLoading, error, clearError } = useAuthStore();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const isPasswordValid = hasMinLength && hasNumber && hasUppercase;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailRegex.test(email);

  const isFormValid =
    fullName.trim().length > 0 &&
    isEmailValid &&
    isPasswordValid &&
    username.trim().length > 0;

  useEffect(() => {
    // Auto-scroll to bottom slowly on mount
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 500);
  }, []);

  useEffect(() => {
    if (error) {
      if (error === "email_exists") {
        setErrorMessage("This email is already registered. Please log in instead.");
      } else if (error === "email_linked_to_google") {
        setErrorMessage("This email is linked to a Google account. Please login with Google.");
      } else if (error === "username_taken") {
        setUsernameError("Username already taken, please choose another.");
      } else {
        setErrorMessage(error);
      }
      clearError();
    }
  }, [error, clearError]);

  const handleEmailSignup = async () => {
    try {
      await signup(email.trim(), password, username.trim(), fullName.trim());
      router.replace("/(auth)/create-profile");
    } catch (err) {
      // Error is handled by the store and shown in Alert
    }
  };

  const handleGitHubLogin = async () => {
    Alert.alert("Button Clicked", "GitHub OAuth button was pressed");
    try {
      const redirectUrl =
        Platform.OS === "web"
          ? "http://localhost:3000/auth/callback"
          : Linking.createURL("auth/callback");
      const url = await oauthLogin("github", redirectUrl, "signup");

      if (Platform.OS === "web") {
        window.location.href = url;
        return;
      }

      const result = await WebBrowser.openAuthSessionAsync(url, redirectUrl);

      if (result.type === "success" && result.url) {
        const urlParams = new URL(result.url).searchParams;
        const code = urlParams.get("code");
        const error = urlParams.get("error");

        if (error) {
          Alert.alert("OAuth Error", error);
        } else if (code) {
          router.replace({
            pathname: "/auth/callback",
            params: { code, intent: "signup" },
          });
        }
      }
    } catch (err: any) {
      Alert.alert("GitHub Login Failed", err.message || "An error occurred");
    }
  };

  const handleGoogleLogin = async () => {
    Alert.alert("Button Clicked", "Google OAuth button was pressed");
    try {
      const redirectUrl =
        Platform.OS === "web"
          ? "http://localhost:3000/auth/callback"
          : Linking.createURL("auth/callback");
      const url = await oauthLogin("google", redirectUrl, "signup");

      if (Platform.OS === "web") {
        window.location.href = url;
        return;
      }

      const result = await WebBrowser.openAuthSessionAsync(url, redirectUrl);

      if (result.type === "success" && result.url) {
        const urlParams = new URL(result.url).searchParams;
        const code = urlParams.get("code");
        const error = urlParams.get("error");

        if (error) {
          Alert.alert("OAuth Error", error);
        } else if (code) {
          router.replace({
            pathname: "/auth/callback",
            params: { code, intent: "signup" },
          });
        }
      }
    } catch (err: any) {
      Alert.alert("Google Login Failed", err.message || "An error occurred");
    }
  };

  return (
    <ScrollView
      ref={scrollViewRef}
      className="flex-1 bg-[#0A0C09]"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <View
        className="px-8 pt-14 w-full"
        style={{ maxWidth: 450, alignSelf: "center" }}
      >
        <View className="items-center">
          <LogoCircle />
        </View>

        <View className="mt-8 items-center">
          <Text className="font-nataBold text-white text-[28px] text-center">
            Create your
          </Text>

          <Text className="font-nataBold text-[#8EFF7A] text-[28px] text-center">
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
            onPress={handleGitHubLogin}
            disabled={isLoading}
          />

          <SocialButton
            label="Continue with Google"
            icon={<GoogleIcon />}
            showChevron
            onPress={handleGoogleLogin}
            disabled={isLoading}
          />
        </View>

        <View className="mt-7">
          <OrDivider />
        </View>

        <View className="mt-6">
          <EmailTab />
        </View>

        <View className="mt-2">
          <SectionLabel title="Full name" />
          <AuthInput
            placeholder="Enter your full name"
            icon="user"
            value={fullName}
            onChangeText={setFullName}
          />

          <SectionLabel title="Username" />
          <AuthInput
            placeholder="Choose a username"
            icon="user"
            value={username}
            onChangeText={(text) => {
              setUsername(text);
              setUsernameError("");
            }}
            autoCapitalize="none"
          />
          {usernameError ? (
            <Text className="text-[#E57373] text-[13px] font-nata mt-1 ml-1">
              {usernameError}
            </Text>
          ) : null}

          <SectionLabel title="Email Address" />
          <AuthInput
            placeholder="Enter your email"
            icon="mail"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          {email.trim().length > 0 && !isEmailValid && (
            <Text className="text-[#E57373] text-[13px] font-nata mt-1 ml-1">
              Please enter a valid email address.
            </Text>
          )}

          <SectionLabel title="Password" />
          <AuthInput
            placeholder="Create a password"
            icon="eye"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <PasswordRules password={password} />

          {errorMessage ? (
            <Text className="text-[#E57373] text-[14px] text-center mt-4 font-nata">
              {errorMessage}
            </Text>
          ) : null}

          <View className="mt-6">
            <PrimaryButton
              label="Create Account"
              onPress={handleEmailSignup}
              style={{ opacity: isFormValid ? 1 : 0.5 }}
              disabled={!isFormValid || isLoading}
            />
          </View>
        </View>

        <AuthFooter
          prompt="Already have an account?"
          linkLabel="Log In"
          onPress={() => router.push("/(auth)/login")}
        />
      </View>
    </ScrollView>
  );
}
