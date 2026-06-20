import "@/global.css";
import { Stack } from "expo-router";
import { useFonts } from "expo-font";

export default function Layout() {
  const [fontsLoaded] = useFonts({
  "NataSans-Regular": require("../../assets/fonts/NataSans-Regular.ttf"),
  "NataSans-SemiBold": require("../../assets/fonts/NataSans-SemiBold.ttf"),
  "NataSans-Bold": require("../../assets/fonts/NataSans-Bold.ttf"),
});

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}