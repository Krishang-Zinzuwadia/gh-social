import { Redirect } from "expo-router";

export default function Index() {
  // Change to "/" or a tabs screen once you have auth state logic
  return <Redirect href="/(auth)/sign-up" />;
}