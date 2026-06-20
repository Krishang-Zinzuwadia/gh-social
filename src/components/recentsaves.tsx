import { View, Text } from "react-native"

export default function RecentSaves({ title }: { title: string }) {
  return (
    // Row Dimensions: 307 x 39
    <View style={{ width: 307, height: 39, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.16)', paddingHorizontal: 12, borderRadius: 10, marginBottom: 8, borderWidth: 1, borderColor: '#2D362F' }}>
      <View style={{ width: 20, height: 20, borderRadius: 4, backgroundColor: '#0F1411', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
        <Text style={{ fontSize: 10 }}>🌌</Text>
      </View>
      <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '500', flex: 1,fontFamily:'Nata Sans' }}>{title}</Text>
    </View>
  )
}