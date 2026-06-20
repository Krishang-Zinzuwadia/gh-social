import { View, Text } from "react-native"
import RecentPins from "./recentpins"
import RecentSaves from "./recentsaves"

export default function Lists() {
  const pinnedLists = [
    { id: 1, pin: "meal-planner" },
    { id: 2, pin: "QuickNotes" },
    { id: 3, pin: "Travel-mate" }
  ]

  const savedCollections = [
    { id: 1, name: "Game Development" },
    { id: 2, name: "UI / UX" },
    { id: 3, name: "Open Source" },
    { id: 4, name: "App Development" }
  ]

  return (
    // Lists Box: 336 x 467
    <View style={{ width: 336, height: 467, borderWidth: 1, borderColor: '#6DA963', borderRadius: 10, backgroundColor: '#191F18', padding: 16 }}>
      <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: 'bold', textAlign: 'center', marginBottom: 12,fontFamily:'Nata Sans' }}>Lists</Text>
      
      {pinnedLists.map((item) => (
        <RecentPins key={item.id} title={item.pin} isPinned={true} />
      ))}

      <Text style={{ color: '#6DA963', fontSize: 12, fontWeight: 'bold', marginTop: 12, marginBottom: 10 ,fontFamily:'Nata Sans'}}>Saved Collections</Text>

      {savedCollections.map((item) => (
        <RecentSaves key={item.id} title={item.name} />
      ))}
    </View>
  )
}