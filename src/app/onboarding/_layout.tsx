import { Stack } from "expo-router";
import { OnboardingProvider } from "../../store/OnboardingContext";

export default function OnboardingLayout() {
  return (
    <OnboardingProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </OnboardingProvider>
  );
}
