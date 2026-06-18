import { Text, View } from 'react-native';

export function TailwindBanner() {
  return (
    <View className="bg-indigo-600 p-6 rounded-2xl shadow-lg border-2 border-indigo-400 my-4 w-full flex-col justify-center items-center">
      <Text className="text-white text-center font-bold text-2xl mb-2">
        Tailwind is Working! 
      </Text>
      <Text className="text-indigo-100 text-center text-base">
        This banner uses NativeWind utility classes.
      </Text>
    </View>
  );
}
