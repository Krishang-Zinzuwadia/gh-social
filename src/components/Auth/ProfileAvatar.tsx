import { View } from "react-native";
import { CameraIcon, SilhouetteIcon } from "./icons";

export default function ProfileAvatar() {
  return (
    <View className="items-center">
      <View className="relative w-[190px] h-[190px] justify-center items-center">
        <View className="absolute inset-0 rounded-full bg-[#1C1C1E]" />
        
        {/* Silhouette inside the big circle */}
        <SilhouetteIcon size={120} color="rgba(235,235,245,0.45)" />

        <View className="absolute bottom-2 right-2
        w-[55px] h-[55px]
        rounded-full border border-[rgba(255,255,255,0.14)]
        bg-[#000000] justify-center items-center">
          <CameraIcon size={24} color="rgba(235,235,245,0.45)" />
        </View>
      </View>
    </View>
  );
}
