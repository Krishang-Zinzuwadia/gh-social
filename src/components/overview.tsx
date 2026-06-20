import { View, Text } from "react-native"
import RecentSaves from "./recentsaves"
import RecentPins from "./recentpins"

export default function Overview() {
  const recentsaves = [
    { id: 1, name: "Game development" },
    { id: 2, name: "UI / UX" },
    { id: 3, name: "Open Source" }
  ]

  const recentpins = [
    { id: 1, pin: "github-social-mobileapp" },
    { id: 2, pin: "weather-app" },
    { id: 3, pin: "task-manager" }
  ]

  return (
    <View style={{ width: 336, gap: 20 }}>
      {/* Recent Saves Box: 336 x 195 */}
      <View style={{ width: 336, height: 195, borderWidth: 1, borderColor: '#6DA963', borderRadius: 10, backgroundColor: '#191F18', padding: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ color: '#6DA963', fontSize: 12, fontWeight: 'bold',fontFamily:'Nata Sans' }}>Recent Saves</Text>
          <Text style={{ color: '#6B7280', fontSize: 10, fontWeight: '500',fontFamily:'Nata Sans' }}>View All</Text>
        </View>
        {recentsaves.map((item) => (
          <RecentSaves key={item.id} title={item.name} />
        ))}
      </View>

      {/* Recent Pins Box: 336 x 195 */}
      <View style={{ width: 336, height: 195, borderWidth: 1, borderColor: '#6DA963', borderRadius: 10, backgroundColor: '#191F18', padding: 16 }}>
        <Text style={{ color: '#6DA963', fontSize: 12, fontWeight: 'bold', marginBottom: 12,fontFamily:'Nata Sans' }}>Recent Pins</Text>
        {recentpins.map((item) => (
          <RecentPins key={item.id} title={item.pin} isPinned={false} />
        ))}
      </View>
    </View>
  )
}