import { useAuthStore } from "@/store/authStore";
import { useGlobalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Platform, Text, View } from "react-native";

export default function OAuthCallback() {
  const router = useRouter();
  const params = useGlobalSearchParams();
  const exchangeOAuthCode = useAuthStore((state) => state.exchangeOAuthCode);
  const exchangeSupabaseToken = useAuthStore(
    (state) => state.exchangeSupabaseToken,
  );
  const checkOnboardingStatus = useAuthStore(
    (state) => state.checkOnboardingStatus,
  );

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        const error = params.error as string;
        const intent = params.intent as "login" | "signup";

        if (error) {
          console.error("[OAuth Callback] Error:", error);
          router.replace("/(auth)/login");
          return;
        }

        // Check for authorization code in query params (backend OAuth flow)
        const code = params.code as string;

        if (code) {
          // Exchange the code for a custom JWT
          await exchangeOAuthCode(code);
        } else if (Platform.OS === "web") {
          // On web, check hash fragment for Supabase implicit flow
          const hash = window.location.hash;
          console.log("[OAuth Callback] Hash fragment:", hash);

          const urlParams = new URLSearchParams(hash.substring(1)); // Remove the '#'
          const accessToken = urlParams.get("access_token");

          if (accessToken) {
            console.log("[OAuth Callback] Found access_token in hash");
            // Exchange the Supabase token for a custom JWT
            await exchangeSupabaseToken(accessToken);
          } else {
            console.error("[OAuth Callback] No code or access_token found");
            router.replace("/(auth)/login");
            return;
          }
        } else {
          console.error("[OAuth Callback] No code found");
          router.replace("/(auth)/login");
          return;
        }

        // Get the updated user state after exchange (our equivalent of supabase.auth.getUser)
        let currentUserId = useAuthStore.getState().user?.id;

        if (!currentUserId) {
          console.warn(
            "[OAuth Callback] User ID undefined, waiting 500ms for session to hydrate...",
          );
          await new Promise((resolve) => setTimeout(resolve, 500));

          // Retry checking state
          await useAuthStore.getState().checkAuth();
          currentUserId = useAuthStore.getState().user?.id;
        }

        console.log("Current UserID:", currentUserId);

        if (!currentUserId) {
          throw new Error(
            "Failed to populate user state after authentication. User ID is undefined.",
          );
        }

        // Always check onboarding status regardless of intent
        console.log("[OAuth Callback] Checking onboarding status for intent:", intent);
        const response = await checkOnboardingStatus();
        console.log("Onboarding Status Response:", response);
        console.log("ROUTING DECISION: Is onboarding completed?", response.onboarding_completed);

        if (response.onboarding_completed) {
          // User has completed onboarding, route to main app
          console.log("[OAuth Callback] Onboarding completed - routing to home");
          router.replace("/(tabs)/home");
        } else {
          // User needs to complete onboarding
          console.log("[OAuth Callback] Onboarding not completed - routing to create-profile");
          router.replace("/(auth)/create-profile");
        }
      } catch (error) {
        console.error("[OAuth Callback] Error:", error);
        router.replace("/(auth)/login");
      }
    };

    handleOAuthCallback();
  }, [
    params,
    exchangeOAuthCode,
    exchangeSupabaseToken,
    checkOnboardingStatus,
    router,
  ]);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#000",
      }}
    >
      <ActivityIndicator size="large" color="#fff" />
      <Text style={{ color: "#fff", marginTop: 16 }}>Authenticating...</Text>
    </View>
  );
}
