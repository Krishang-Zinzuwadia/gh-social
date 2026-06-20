import { Redirect } from "expo-router";

export default function Index() {
  // TODO: Replace with real auth state logic
  const isAuthenticated = false;

  if (isAuthenticated) {
    return <Redirect href="/" />;
  }

  return <Redirect href="/(auth)/sign-up" />;
}