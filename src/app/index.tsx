import { View, Pressable, Text, Image, Modal, TextInput, ScrollView } from "react-native"
import { useState } from "react"
import { SafeAreaView } from "react-native-safe-area-context"
import Overview from "@/components/overview"
import Repositories from "@/components/repositories"
import Lists from "@/components/lists"

export default function Profile() {
  const [modal, setModal] = useState(false)
  const [name, setName] = useState("Navyaa Batra")
  const [job, setJob] = useState("Full Stack Developer")
  const [username, setUsername] = useState("navyaabatra")
  const [location, setLocation] = useState("India")
  const [image, setImage] = useState(require("../../assets/images/pfp.jpeg"))
  const [activetab, setActivetab] = useState("Lists")

  const stats = [
    { id: "likes", icon: "❤️", value: "1.2K", label: "Likes given" },
    { id: "followers", icon: "👥", value: "300", label: "Followers" },
    { id: "saved", icon: "🔖", value: "156", label: "Saved" },
    { id: "following", icon: "➕", value: "289", label: "Following" }
  ]

  return (
    // Restored the clean deep dark background
    <View style={{ flex: 1, backgroundColor: '#090D0A', alignItems: 'center', justifyContent: 'flex-start', minHeight: '100vh' }}>
      <SafeAreaView style={{ width: 375, flex: 1, backgroundColor: '#090D0A' }}>
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          
          {/* Header Section */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 32, paddingHorizontal: 20 }}>
            <View style={{ width: 80, height: 80, borderRadius: 40, overflow: 'hidden', backgroundColor: 'rgba(123, 201, 111, 0.1)', borderWidth: 1, borderColor: '#6DA963', justifyContent: 'center', alignItems: 'center' }}>
              <Image style={{ width: '100%', height: '100%' }} source={image} resizeMode="cover" />
            </View>

            <View style={{ marginLeft: 16, flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', letterSpacing: 0.5, fontFamily: 'Noto Sans' }}>{name}</Text>
                <Pressable style={{ marginLeft: 8, padding: 4 }} onPress={() => setModal(true)}>
                  <Text style={{ color: '#6DA963', fontSize: 14, fontFamily: 'Noto Sans' }}>✏️</Text>
                </Pressable>
              </View>
              <Text style={{ color: '#6DA963', fontSize: 12, fontWeight: '600', marginTop: 2, fontFamily: 'Noto Sans' }}>{job}</Text>
              <Text style={{ color: '#FFFFFF', fontSize: 12, marginTop: 2, fontFamily: 'Noto Sans' }}>Username: {username}</Text>
              <Text style={{ color: '#FFFFFF', fontSize: 12, marginTop: 2, fontFamily: 'Noto Sans' }}>📍 {location}</Text>
            </View>
          </View>

          {/* Stats Section */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 24, paddingHorizontal: 16 }}>
            {stats.map((stat, index) => (
              <View key={stat.id} style={{ alignItems: 'center', flex: 1, borderLeftWidth: index !== 0 ? 1 : 0, borderLeftColor: '#1E2E20' }}>
                <Text style={{ fontSize: 14, fontFamily: 'Noto Sans' }}>{stat.icon}</Text>
                <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: 'bold', marginTop: 4, fontFamily: 'Noto Sans' }}>{stat.value}</Text>
                <Text style={{ color: '#FFFFFF', fontSize: 10, marginTop: 2, textAlign: 'center', fontWeight: '500', opacity: 0.8, fontFamily: 'Noto Sans' }}>{stat.label}</Text>
              </View>
            ))}
          </View>

          {/* Navigation Tabs */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 48, marginTop: 32, marginBottom: 24, borderBottomWidth: 1, borderBottomColor: '#141F16', paddingBottom: 8 }}>
            <Pressable onPress={() => setActivetab(activetab === "Overview" ? "Lists" : "Overview")}>
              <Text 
                style={{ 
                  fontSize: 14,
                  fontWeight: '600',
                  letterSpacing: 0.5,
                  paddingBottom: 4,
                  fontFamily: 'Noto Sans',
                  color: activetab === "Overview" ? "#6DA963" : "#FFFFFF",
                  borderBottomWidth: activetab === "Overview" ? 2 : 0,
                  borderBottomColor: "#6DA963"
                }}
              >
                Overview
              </Text>
            </Pressable>

            <Pressable onPress={() => setActivetab(activetab === "Repositories" ? "Lists" : "Repositories")}>
              <Text 
                style={{ 
                  fontSize: 14,
                  fontWeight: '600',
                  letterSpacing: 0.5,
                  paddingBottom: 4,
                  fontFamily: 'Noto Sans',
                  color: activetab === "Repositories" ? "#6DA963" : "#FFFFFF",
                  borderBottomWidth: activetab === "Repositories" ? 2 : 0,
                  borderBottomColor: "#6DA963"
                }}
              >
                Repositories
              </Text>
            </Pressable>
          </View>

          {/* Render Window Context wrapper container */}
          <View style={{ width: '100%', paddingHorizontal: 20 }}>
            {activetab === "Overview" && <Overview />}
            {activetab === "Repositories" && <Repositories />}
            {activetab === "Lists" && <Lists />}
          </View>

        </ScrollView>
      </SafeAreaView>

      {/* Edit Profile Opaque Screen Form Overlay */}
      <Modal visible={modal} animationType="fade" transparent={false}>
        <View style={{ flex: 1, backgroundColor: '#090D0A', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <View style={{ width: '100%', maxWidth: 320 }}>
            <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: 'bold', marginBottom: 24, borderBottomWidth: 1, borderBottomColor: '#232D25', paddingBottom: 8, textAlign: 'center', fontFamily: 'Noto Sans' }}>Edit Profile</Text>
            
            <Text style={{ color: '#6DA963', fontSize: 12, fontWeight: 'bold', marginBottom: 6, textTransform: 'uppercase', fontFamily: 'Noto Sans' }}>Full Name</Text>
            <TextInput style={{ backgroundColor: '#141915', color: '#FFFFFF', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#232D25', marginBottom: 16, fontFamily: 'Noto Sans' }} value={name} onChangeText={setName} />
            
            <Text style={{ color: '#6DA963', fontSize: 12, fontWeight: 'bold', marginBottom: 6, textTransform: 'uppercase', fontFamily: 'Noto Sans' }}>Job Role</Text>
            <TextInput style={{ backgroundColor: '#141915', color: '#FFFFFF', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#232D25', marginBottom: 16, fontFamily: 'Noto Sans' }} value={job} onChangeText={setJob} />
            
            <Text style={{ color: '#6DA963', fontSize: 12, fontWeight: 'bold', marginBottom: 6, textTransform: 'uppercase', fontFamily: 'Noto Sans' }}>Username</Text>
            <TextInput style={{ backgroundColor: '#141915', color: '#FFFFFF', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#232D25', marginBottom: 16, fontFamily: 'Noto Sans' }} value={username} onChangeText={setUsername} />
            
            <Text style={{ color: '#6DA963', fontSize: 12, fontWeight: 'bold', marginBottom: 6, textTransform: 'uppercase', fontFamily: 'Noto Sans' }}>Location</Text>
            <TextInput style={{ backgroundColor: '#141915', color: '#FFFFFF', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#232D25', marginBottom: 32, fontFamily: 'Noto Sans' }} value={location} onChangeText={setLocation} />
            
            <Pressable style={{ backgroundColor: '#6DA963', paddingVertical: 16, borderRadius: 12, alignItems: 'center' }} onPress={() => setModal(false)}>
              <Text style={{ fontWeight: 'bold', color: '#090D0A', textTransform: 'uppercase', letterSpacing: 1, fontSize: 12, fontFamily: 'Noto Sans' }}>Save Details</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  )
}