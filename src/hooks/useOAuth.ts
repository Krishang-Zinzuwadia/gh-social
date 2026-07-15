import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { useState } from 'react';
import { useAuth } from '@/store/AuthContext';
import { getOAuthUrl, exchangeCode } from '@/api/auth';

export function useOAuth() {
  const { setSession } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signInWithProvider = async (provider: 'github' | 'google') => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Get the OAuth URL from our backend
      const oauthUrl = await getOAuthUrl(provider);

      // 2. The redirect URI the backend will redirect back to after OAuth completes.
      //    Must match CLIENT_URL in backend/.env (e.g. "ghsocial://callback")
      const redirectUri = Linking.createURL('callback');
      
      // 3. Open the in-app browser — it will intercept the redirect automatically
      const result = await WebBrowser.openAuthSessionAsync(oauthUrl, redirectUri);

      if (result.type !== 'success') {
        // User cancelled or browser closed — not an error, just bail silently
        return;
      }

      // 4. Parse the short-lived code from the redirected URL
      const parsed = Linking.parse(result.url);
      const code = parsed.queryParams?.code as string | undefined;

      if (!code) {
        const errMsg = (parsed.queryParams?.error as string) || 'OAuth failed: no code received';
        setError(errMsg);
        return;
      }

      // 5. Exchange code for our custom JWT + refresh token
      const data = await exchangeCode(code);

      // 6. Persist session — AuthContext fetches profile which includes onboarding_completed.
      //    _layout.tsx will then automatically redirect to onboarding or tabs.
      await setSession(data.accessToken, data.user);

    } catch (err: any) {
      setError(err.message || 'OAuth sign-in failed');
    } finally {
      setIsLoading(false);
    }
  };

  return { signInWithProvider, isLoading, error };
}
