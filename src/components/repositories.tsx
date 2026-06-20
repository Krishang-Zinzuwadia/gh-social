import { View, Text } from "react-native"
import RecentPins from "./recentpins"

export default function Repositories() {
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

  return (
    // Repositories Box: 336 x 467
    <View style={{ width: 336, height: 467, borderWidth: 1, borderColor: '#6DA963', borderRadius: 10, backgroundColor: '#191F18', padding: 16 }}>
      {pinnedRepos.map((item) => (
        <RecentPins key={item.id} title={item.pin} isPinned={true} />
      ))}

      <Text style={{ color: '#6DA963', fontSize: 12, fontWeight: 'bold', marginTop: 12, marginBottom: 10,fontFamily:'Nata Sans' }}>All Repositories</Text>

      {allRepos.map((item) => (
        <RecentPins key={item.id} title={item.pin} isPinned={false} />
      ))}
    </View>
  )
}