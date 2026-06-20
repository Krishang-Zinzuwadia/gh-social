import { View, Text, Image, Pressable } from "react-native";

type Props = {
  name: string;
  role: string;
  username: string;
  location: string;
};

export default function ProfileHeader({
  name,
  role,
  username,
  location,
}: Props) {
  return (
    <View className="flex-row px-6 mt-6">
      <Image
        source={require("../../assets/images/pfp.jpeg")}
        className="w-28 h-28 rounded-full bg-[#7BC96F]"
      />

      <View className="ml-4 flex-1 justify-center">
        <View className="flex-row items-center">
          <Text className="text-white text-3xl font-bold">
            {name}
          </Text>

          <Pressable className="ml-3">
            <Text className="text-[#7BC96F] text-xl">
              ✏️
            </Text>
          </Pressable>
        </View>

        <Text className="text-[#7BC96F] text-lg">
          {role}
        </Text>

        <Text className="text-gray-300 text-base">
          Username: {username}
        </Text>

        <Text className="text-gray-300 text-base">
          📍 {location}
        </Text>
      </View>
    </View>
  );
}