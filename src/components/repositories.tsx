import { View, Text, useWindowDimensions } from "react-native"
import Svg, { Path, Circle } from "react-native-svg"
import RecentPins from "./recentpins"

export default function Repositories() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const pinnedRepos = [
    { id: 1, pin: "github-social-mobileapp" },
    { id: 2, pin: "weather-app" },
    { id: 3, pin: "task-manager" }
  ]

  const allRepos = [
    { id: 4, pin: "notes-app" },
    { id: 5, pin: "calculator-app" },
    { id: 6, pin: "no-name-app" },
    { id: 7, pin: "stocks-app" }
  ]

  if (isTablet) {
    return (
      <View className="w-full h-[467px] border border-[#6DA963] rounded-[10px] bg-[#191F18] px-4 pt-[24px] pb-[16px] justify-start relative">
        {/* Green timeline connector elements for Repositories tab */}
        {/* Left segment (card anchor) */}
        <Svg
          pointerEvents="none"
          style={{
            position: "absolute",
            left: 22,
            top: -56,
            width: 15,
            height: 57,
          }}
          viewBox="0 0 15 57"
          fill="none"
        >
          <Path d="M15 44.6189C5.77342 44.1011 2.92779 45.1628 3.00138 50.0194L3.00138 56.5" stroke="#359030" />
          <Path d="M4.03809 42.3299C5.94299 42.3299 7.57617 44.067 7.57617 46.325C7.57604 48.5829 5.94292 50.3191 4.03809 50.3191C2.13323 50.3191 0.500131 48.5829 0.5 46.325C0.5 44.0669 2.13315 42.3299 4.03809 42.3299Z" stroke="#6DA963" />
          <Path d="M4.03809 44.1279C5.05095 44.1279 5.96094 45.0601 5.96094 46.3252C5.96077 47.5901 5.05086 48.5214 4.03809 48.5215C3.0253 48.5215 2.11541 47.5901 2.11523 46.3252C2.11523 45.0601 3.0252 44.1279 4.03809 44.1279Z" fill="white" stroke="#6DA963" />
        </Svg>

        {/* Stretching middle line */}
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: 37,
            right: "50%",
            marginRight: 2,
            top: -11.5,
            height: 1,
            backgroundColor: "#359030",
          }}
        />

        {/* Right segment (tab anchor) */}
        <Svg
          pointerEvents="none"
          style={{
            position: "absolute",
            left: "50%",
            marginLeft: -4,
            top: -56,
            width: 18,
            height: 45,
          }}
          viewBox="0 0 18 45"
          fill="none"
        >
          <Circle cx={15} cy={4} r={3.5} stroke="#6DA963" />
          <Circle cx={15} cy={4.0001} r={1.9} fill="white" stroke="#6DA963" />
          <Path d="M16.997 2.49997V32.18C17.124 41.1027 13.474 43.3685 2 44.5" stroke="#359030" />
        </Svg>

        {pinnedRepos.map((item) => (
          <RecentPins key={item.id} title={item.pin} isPinned={true} />
        ))}

        <View className="w-full px-1 mb-3.5 mt-4">
          <Text style={{ top: -2 }} className="text-[#6DA963] text-[12px] font-bold font-noto">All Repositories</Text>
        </View>

        {allRepos.map((item) => (
          <RecentPins key={item.id} title={item.pin} isPinned={false} />
        ))}
      </View>
    )
  }

  return (
    // Repositories Box: 336 x 467 (mobile default)
    <View className="w-full h-[467px] border border-[#6DA963] rounded-[10px] bg-[#191F18] px-4 pt-[24px] pb-[16px] relative">
      {/* Green timeline connector elements for Repositories tab */}
      {/* Left segment (card anchor) */}
      <Svg
        pointerEvents="none"
        style={{
          position: "absolute",
          left: 22,
          top: -56,
          width: 15,
          height: 57,
        }}
        viewBox="0 0 15 57"
        fill="none"
      >
        <Path d="M15 44.6189C5.77342 44.1011 2.92779 45.1628 3.00138 50.0194L3.00138 56.5" stroke="#359030" />
        <Path d="M4.03809 42.3299C5.94299 42.3299 7.57617 44.067 7.57617 46.325C7.57604 48.5829 5.94292 50.3191 4.03809 50.3191C2.13323 50.3191 0.500131 48.5829 0.5 46.325C0.5 44.0669 2.13315 42.3299 4.03809 42.3299Z" stroke="#6DA963" />
        <Path d="M4.03809 44.1279C5.05095 44.1279 5.96094 45.0601 5.96094 46.3252C5.96077 47.5901 5.05086 48.5214 4.03809 48.5215C3.0253 48.5215 2.11541 47.5901 2.11523 46.3252C2.11523 45.0601 3.0252 44.1279 4.03809 44.1279Z" fill="white" stroke="#6DA963" />
      </Svg>

      {/* Stretching middle line */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          left: 37,
          right: "50%",
          marginRight: 2,
          top: -11.5,
          height: 1,
          backgroundColor: "#359030",
        }}
      />

      {/* Right segment (tab anchor) */}
      <Svg
        pointerEvents="none"
        style={{
          position: "absolute",
          left: "50%",
          marginLeft: -4,
          top: -56,
          width: 18,
          height: 45,
        }}
        viewBox="0 0 18 45"
        fill="none"
      >
        <Circle cx={15} cy={4} r={3.5} stroke="#6DA963" />
        <Circle cx={15} cy={4.0001} r={1.9} fill="white" stroke="#6DA963" />
        <Path d="M16.997 2.49997V32.18C17.124 41.1027 13.474 43.3685 2 44.5" stroke="#359030" />
      </Svg>
      {pinnedRepos.map((item) => (
        <RecentPins key={item.id} title={item.pin} isPinned={true} />
      ))}

      <View className="w-full px-1 mb-[13px]">
        <Text style={{ top: -2 }} className="text-[#6DA963] text-[12px] font-bold font-noto">All Repositories</Text>
      </View>

      {allRepos.map((item) => (
        <RecentPins key={item.id} title={item.pin} isPinned={false} />
      ))}
    </View>
  )
}