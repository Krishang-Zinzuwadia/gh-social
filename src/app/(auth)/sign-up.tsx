import { useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { useOAuth } from '../../hooks/useOAuth';

import AuthFooter from '@/components/Auth/AuthFooter';
import { GithubIcon, GoogleIcon, MailIcon } from '@/components/Auth/icons';
import LogoCircle from '@/components/Auth/LogoCircle';
import OrDivider from '@/components/Auth/OrDivider';
import SocialButton from '@/components/Auth/SocialButton';

export default function SignUpScreen() {
  const router = useRouter();
  const { signInWithProvider, isLoading: oauthLoading, error: oauthError } = useOAuth();

  return (
    <View className="flex-1 bg-[#0A0C09]">
      <ScrollView
        contentContainerStyle={{
          paddingBottom: 48,
          paddingHorizontal: 30,
          flexGrow: 1,
          justifyContent: 'center',
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ maxWidth: 450, width: '100%', alignSelf: 'center' }}>
          <View className="items-center mb-10">
            <LogoCircle size={190} />
          </View>

        <View className="mb-10 items-center">
          <Text className="text-white text-3xl leading-tight text-center font-nataBold">
            Join{' '}
            <Text className="text-[#8EFF7A] font-nataBold">Weave</Text>
          </Text>
          <Text className="text-white/50 text-sm mt-2 text-center font-nata">
            Connect. Collaborate. Work Together.
          </Text>
        </View>

        <View className="gap-y-3">
          <SocialButton
            label={oauthLoading ? "Opening..." : "Continue with GitHub"}
            icon={<GithubIcon size={20} color="#ffffff" />}
            showChevron
            disabled={oauthLoading}
            onPress={() => signInWithProvider('github')}
          />
          <SocialButton
            label={oauthLoading ? "Opening..." : "Continue with Google"}
            icon={<GoogleIcon size={20} />}
            showChevron
            disabled={oauthLoading}
            onPress={() => signInWithProvider('google')}
          />
          <SocialButton
            label="Continue with Email"
            icon={<MailIcon size={20} color="#8EFF7A" />}
            showChevron
            onPress={() => router.push('/(auth)/sign-up-email')}
          />
        </View>

        {oauthError ? (
          <Text className="text-[#E57373] text-[13px] font-nata mt-3 text-center">
            {oauthError}
          </Text>
        ) : null}

        <View className="mt-8 mb-6">
          <OrDivider />
        </View>

        <AuthFooter
          prompt="Already have an account?"
          linkLabel="Log in"
          onPress={() => router.push('/(auth)/login')}
        />

        <Text className="text-white/30 text-[16px] text-center mt-6 leading-6 font-nata">
          By signing up, you agree to our{'\n'}
          <Text className="text-[#8EFF7A] font-nata">Terms of Service</Text>{' '}
          and <Text className="text-[#8EFF7A] font-nata">Privacy Policy</Text>.
        </Text>
        </View>
      </ScrollView>
    </View>
  );
}
