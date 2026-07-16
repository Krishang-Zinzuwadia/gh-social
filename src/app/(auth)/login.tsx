import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";

import AuthFooter from "@/components/Auth/AuthFooter";
import LogoCircle from "@/components/Auth/LogoCircle";
import OrDivider from "@/components/Auth/OrDivider";
import PrimaryButton from "@/components/Auth/PrimaryButton";
import SocialButton from "@/components/Auth/SocialButton";

import LoginInput from "@/components/Auth/LoginInput";
import RememberMe from "@/components/Auth/RememberMe";
import { API_URL } from "@/constants/api";

import {
    GithubIcon,
    GoogleIcon,
} from "@/components/Auth/icons";

export default function LoginScreen() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 500);
  }, []);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setLoginError("Enter your email and password.");
      return;
    }

    setIsLoggingIn(true);
    setLoginError("");
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error ?? "Unable to log in.");
      router.replace("/(tabs)/home");
    } catch (error) {
      setLoginError(
        error instanceof TypeError
          ? `Unable to reach the backend at ${API_URL}.`
          : error instanceof Error ? error.message : "Unable to log in."
      );
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <ScrollView
      ref={scrollViewRef}
      className="flex-1 bg-[#0A0C09]"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <View className="px-8 pt-14">

        {/* Logo */}
        <View className="items-center">
          <LogoCircle />
        </View>

        {/* Heading */}
        <View className="items-center mt-8">
          <Text
            
            className="text-white text-[30px] text-center font-nataBold"
          >
            Welcome Back!
          </Text>

          <Text
            
            className="text-[#8A8A8A] text-[14px] mt-3 text-center font-nata"
          >
            Glad to see you again.
          </Text>
        </View>

        {/* Social buttons */}
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

        {/* Divider */}
        <View className="mt-7">
          <OrDivider />
        </View>

        {/* Email */}
        <Text
          
          className="text-white text-[15px] mt-8 mb-3 font-nata"
        >
          Email
        </Text>

        <LoginInput
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          textContentType="emailAddress"
        />

        {/* Password */}
        <Text
          
          className="text-white text-[15px] mt-7 mb-3 font-nata"
        >
          Password
        </Text>

        <LoginInput
          placeholder="Enter your password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          textContentType="password"
          onSubmitEditing={handleLogin}
        />

        {/* Remember me */}
        <RememberMe />

        {/* Button */}
        <View className="mt-8">
          <PrimaryButton
            label={isLoggingIn ? "Logging in…" : "Log In"}
            disabled={isLoggingIn}
            onPress={handleLogin}
          />
          {isLoggingIn ? <ActivityIndicator className="mt-3" color="#6DA963" /> : null}
          {loginError ? (
            <Text selectable className="mt-3 text-center font-nata text-[13px] text-[#FF6878]">
              {loginError}
            </Text>
          ) : null}
        </View>

        {/* Footer */}
        <AuthFooter
          prompt="Don't have an account?"
          linkLabel="Sign up"
          onPress={() => router.push("/(auth)/sign-up")}
        />

      </View>
    </ScrollView>
  );
}
