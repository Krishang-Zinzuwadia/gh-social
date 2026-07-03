<<<<<<< HEAD
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
=======
import * as Linking from 'expo-linking';
import { useRouter } from "expo-router";
import * as WebBrowser from 'expo-web-browser';
>>>>>>> b00059593453532204c829d68f38b2c7519ada21
import { useEffect, useRef, useState } from "react";
import { Alert, Platform, ScrollView, Text, View } from "react-native";

import AuthFooter from "@/components/Auth/AuthFooter";
import LoginInput from "@/components/Auth/LoginInput";
import LogoCircle from "@/components/Auth/LogoCircle";
import OrDivider from "@/components/Auth/OrDivider";
import PrimaryButton from "@/components/Auth/PrimaryButton";
import RememberMe from "@/components/Auth/RememberMe";
import SocialButton from "@/components/Auth/SocialButton";

import {
    GithubIcon,
    GoogleIcon,
} from "@/components/Auth/icons";
import { useAuthStore } from '@/store/authStore';
import { getAuthCallbackUrl } from '@/utils/urlHelper';

export default function LoginScreen() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const { login, oauthLogin, isLoading, error, clearError, checkOnboardingStatus } = useAuthStore();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const {
    login,
    oauthLogin,
    isLoading,
    error,
    clearError,
    checkOnboardingStatus,
  } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Validation logic for the UI
  const isFormValid =
    email.trim().length > 0 && password.length > 0 && !isLoading;

  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 500);
  }, []);

  useEffect(() => {
    if (error) {
      Alert.alert("Error", error);
      clearError();
    }
  }, [error, clearError]);

  const handleEmailLogin = async () => {
<<<<<<< HEAD
    if (!isFormValid) return;
    try {
      await login(email.trim(), password);

      // Check onboarding status to determine routing
      const { onboarding_completed } = await checkOnboardingStatus();

=======
    try {
      await login(email.trim(), password);
      
      // Check onboarding status to determine routing
      const { onboarding_completed } = await checkOnboardingStatus();
      
>>>>>>> b00059593453532204c829d68f38b2c7519ada21
      if (onboarding_completed) {
        router.replace("/(tabs)/home");
      } else {
        router.replace("/(auth)/create-profile");
      }
    } catch (err) {
      // Error is handled by the store and shown in Alert
    }
  };

  const handleGitHubLogin = async () => {
    try {
      const redirectUrl = getAuthCallbackUrl();
      const url = await oauthLogin('github', redirectUrl, 'login');
      
      // On web, use direct redirect to avoid COOP policy issues
      if (Platform.OS === 'web') {
        window.location.href = url;
        return;
      }
<<<<<<< HEAD

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
            params: { code, intent: "login" },
          });
        }
      }
    } catch (err: any) {
      Alert.alert("GitHub Login Failed", err.message || "An error occurred");
=======
      
      const result = await WebBrowser.openAuthSessionAsync(url, redirectUrl);
      
      if (result.type === 'success' && result.url) {
        const urlParams = new URL(result.url).searchParams;
        const code = urlParams.get('code');
        const error = urlParams.get('error');
        
        if (error) {
          Alert.alert('OAuth Error', error);
        } else if (code) {
          // The callback will handle the routing
          router.replace({ pathname: '/auth/callback', params: { code, intent: 'login' } });
        }
      }
    } catch (err: any) {
      Alert.alert('GitHub Login Failed', err.message || 'An error occurred');
>>>>>>> b00059593453532204c829d68f38b2c7519ada21
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const redirectUrl = getAuthCallbackUrl();
      const url = await oauthLogin('google', redirectUrl, 'login');
      
      // On web, use direct redirect to avoid COOP policy issues
      if (Platform.OS === 'web') {
        window.location.href = url;
        return;
      }
<<<<<<< HEAD

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
            params: { code, intent: "login" },
          });
        }
      }
    } catch (err: any) {
      Alert.alert("Google Login Failed", err.message || "An error occurred");
=======
      
      const result = await WebBrowser.openAuthSessionAsync(url, redirectUrl);
      
      if (result.type === 'success' && result.url) {
        const urlParams = new URL(result.url).searchParams;
        const code = urlParams.get('code');
        const error = urlParams.get('error');
        
        if (error) {
          Alert.alert('OAuth Error', error);
        } else if (code) {
          // The callback will handle the routing
          router.replace({ pathname: '/auth/callback', params: { code, intent: 'login' } });
        }
      }
    } catch (err: any) {
      Alert.alert('Google Login Failed', err.message || 'An error occurred');
>>>>>>> b00059593453532204c829d68f38b2c7519ada21
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

        <View className="items-center mt-8">
          <Text className="text-white text-[30px] text-center font-nataBold">
            Welcome Back!
          </Text>
          <Text className="text-[#8A8A8A] text-[14px] mt-3 text-center font-nata">
            Glad to see you again.
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

<<<<<<< HEAD
        <Text className="text-white text-[15px] mt-8 mb-3 font-nata">
=======
        {/* Email */}
        <Text
          
          className="text-white text-[15px] mt-8 mb-3 font-nata"
        >
>>>>>>> b00059593453532204c829d68f38b2c7519ada21
          Email
        </Text>

        <LoginInput
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text className="text-white text-[15px] mt-7 mb-3 font-nata">
          Password
        </Text>

        <LoginInput
          placeholder="Enter your password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <RememberMe />

        <View className="mt-8">
          <PrimaryButton
<<<<<<< HEAD
            label={isLoading ? "Logging In..." : "Log In"}
            onPress={handleEmailLogin}
            style={{ opacity: isFormValid ? 1 : 0.5 }}
            disabled={!isFormValid}
=======
            label="Log In"
            onPress={handleEmailLogin}
            disabled={isLoading}
>>>>>>> b00059593453532204c829d68f38b2c7519ada21
          />
        </View>

        <AuthFooter
          prompt="Don't have an account?"
          linkLabel="Sign up"
          onPress={() => router.push("/(auth)/sign-up")}
        />
      </View>
    </ScrollView>
  );
}
