import Constants from "expo-constants"

const CONFIGURED_API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://127.0.0.1:5050/api"

function resolveDevelopmentApiUrl() {
  if (!__DEV__ || process.env.EXPO_OS === "web") return CONFIGURED_API_URL

  try {
    const url = new URL(CONFIGURED_API_URL)
    const usesLoopback = url.hostname === "127.0.0.1" || url.hostname === "localhost"
    const expoHost = Constants.expoConfig?.hostUri?.split(":")[0]

    if (usesLoopback && expoHost) {
      url.hostname = expoHost
      return url.toString().replace(/\/$/, "")
    }
  } catch {
    // A malformed custom URL will be surfaced by the request that uses it.
  }

  return CONFIGURED_API_URL.replace(/\/$/, "")
}

export const API_URL = resolveDevelopmentApiUrl()
