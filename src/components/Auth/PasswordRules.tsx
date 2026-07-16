import { Text, View } from "react-native";


function Rule({ text, met }: { text: string; met: boolean }) {
  return (
    <View className="flex-row items-center mt-2">
      <View
        className={`w-3 h-3 rounded-full border justify-center items-center ${
          met
            ? "border-[#63E08A] bg-[#63E08A]"
            : "border-[rgba(255,255,255,0.14)] bg-transparent"
        }`}
      />

      <Text
        className="text-[rgba(235,235,245,0.6)] ml-3 text-[12px] font-nata"
      >
        {text}
      </Text>
    </View>
  );
}

export default function PasswordRules({ password = "" }: { password?: string }) {
  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasUppercase = /[A-Z]/.test(password);

  return (
    <View className="mt-5">
      <Rule text="At least 8 characters" met={hasMinLength} />
      <Rule text="Includes a number" met={hasNumber} />
      <Rule text="Includes an uppercase letter" met={hasUppercase} />
    </View>
  );
}
