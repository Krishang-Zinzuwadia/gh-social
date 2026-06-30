import { View, Text } from "react-native"
import { NebulaIcon } from "./icons"

export default function RecentSaves({ title }: { title: string }) {
  return (
    // Row Dimensions: 307 x 39
    <View 
      className="w-full h-[39px] flex-row items-center rounded-[10px] overflow-hidden bg-[#3E433C] mb-[13px]"
    >
      <View className="w-[39px] h-[39px] rounded-[10px] overflow-hidden">
        <NebulaIcon width={39} height={39} />
      </View>
      <Text className="text-white text-[16px] font-normal flex-1 font-noto ml-3 relative top-[-2px]">{title}</Text>
    </View>
  )
}