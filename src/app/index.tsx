import React, { useState } from "react"
import { View, Pressable, Text, Modal, TextInput } from "react-native"
import Svg, { Path } from "react-native-svg"
import { SafeAreaView } from "react-native-safe-area-context"
import Overview from "@/components/overview"
import Repositories from "@/components/repositories"
import Lists from "@/components/lists"
import { HeartIcon, FollowerUserIcon, BookmarkIcon, GroupFollowersIcon, PencilIcon, ProfileAvatarIcon } from '@/components/icons'

export default function Profile() {
  const [modal, setModal] = useState(false)
  const [name, setName] = useState("Navyaa Batra")
  const [job, setJob] = useState("Full Stack Developer")
  const [username, setUsername] = useState("navyaabatra")
  const [activetab, setActivetab] = useState("Lists")

  const stats = [
    { id: "likes", value: "1.2K", label: "Likes given" },
    { id: "followers", value: "300", label: "Followers" },
    { id: "saved", value: "156", label: "Saved" },
    { id: "following", value: "289", label: "Following" }
  ]

  const getStatIcon = (id: string) => {
    switch (id) {
      case 'likes':
        return <HeartIcon width={23} height={20} fill="#6DA963" />;
      case 'followers':
        return <GroupFollowersIcon width={22} height={19} fill="#6DA963" />;
      case 'saved':
        return <BookmarkIcon width={15} height={19} fill="#6DA963" />;
      case 'following':
        return <FollowerUserIcon width={24} height={24} fill="#6DA963" />;
      default:
        return null;
    }
  };

  return (
    // Restored the clean deep dark background
    <View className="flex-1 bg-[#090D0A] items-center justify-start min-h-screen">
      <SafeAreaView className="w-full flex-1 bg-[#090D0A]">
        <View className="flex-1 pb-[120px]">
          
          {/* Header Section */}
          <View className="flex-row items-center mt-[72px] px-5">
            <View className="w-[92px] h-[92px] justify-center items-center">
              <ProfileAvatarIcon width={92} height={92} />
            </View>

            <View className="ml-4 flex-1">
              <View className="flex-row items-center">
                <Text className="text-white text-[18px] font-bold tracking-[0.5px] font-noto">{name}</Text>
                <Pressable className="ml-2 p-1" onPress={() => setModal(true)}>
                  <PencilIcon size={11} fill="#6DA963" />
                </Pressable>
              </View>
              <Text className="text-[#6DA963] text-[12px] font-semibold mt-[2px] font-noto">{job}</Text>
              <Text className="text-white text-[12px] mt-[2px] font-noto">Username: {username}</Text>
            </View>
          </View>

          {/* Stats Section */}
          <View className="flex-row justify-between mt-6 px-4 items-center">
            {stats.map((stat, index) => (
              <React.Fragment key={stat.id}>
                {index !== 0 && (
                  <Svg width={1} height={62} viewBox="0 0 1 62" fill="none">
                    <Path opacity={0.4} d="M0.5 0C0.466667 1.03333 0.435 2.06667 0.405 3.1C0.135 12.4 0 21.7 0 31C0 40.3 0.135 49.6 0.405 58.9C0.435 59.9333 0.466667 60.9667 0.5 62C0.533333 60.9667 0.565 59.9333 0.595 58.9C0.865 49.6 1 40.3 1 31C1 21.7 0.865 12.4 0.595 3.1C0.565 2.06667 0.533333 1.03333 0.5 0Z" fill="white" />
                  </Svg>
                )}
                <View className="items-center flex-1">
                  <View className="h-7 justify-center items-center">
                    {getStatIcon(stat.id)}
                  </View>
                  <Text className="text-white text-[14px] font-bold mt-1 font-noto">{stat.value}</Text>
                  <Text className="text-white text-[10px] mt-[2px] text-center font-medium opacity-80 font-noto">{stat.label}</Text>
                </View>
              </React.Fragment>
            ))}
          </View>

          {/* Navigation Tabs */}
          <View className="flex-row justify-center gap-24 mt-[96px] mb-6 pb-2">
            <Pressable onPress={() => setActivetab(activetab === "Overview" ? "Lists" : "Overview")}>
              <Text 
                className={`text-[14px] font-semibold tracking-[0.5px] pb-1 font-noto border-[#6DA963] relative top-[-2px] ${
                  activetab === "Overview" ? "text-[#6DA963] border-b-2" : "text-white border-b-0"
                }`}
              >
                Overview
              </Text>
            </Pressable>

            <Pressable onPress={() => setActivetab(activetab === "Repositories" ? "Lists" : "Repositories")}>
              <Text 
                className={`text-[14px] font-semibold tracking-[0.5px] pb-1 font-noto border-[#6DA963] relative top-[-2px] ${
                  activetab === "Repositories" ? "text-[#6DA963] border-b-2" : "text-white border-b-0"
                }`}
              >
                Repositories
              </Text>
            </Pressable>
          </View>

          {/* Render Window Context wrapper container */}
          <View className="w-full flex-1 px-5 items-center">
            {activetab === "Overview" && <Overview />}
            {activetab === "Repositories" && <Repositories />}
            {activetab === "Lists" && <Lists />}
          </View>

        </View>
      </SafeAreaView>

      {/* Edit Profile Opaque Screen Form Overlay */}
      <Modal visible={modal} animationType="fade" transparent={false}>
        <View className="flex-1 bg-[#090D0A] justify-center items-center p-6">
          <View className="w-full max-w-[320px]">
            <Text className="text-white text-[20px] font-bold mb-6 border-b border-[#232D25] pb-2 text-center font-noto">Edit Profile</Text>
            
            <Text className="text-[#6DA963] text-[12px] font-bold mb-[6px] uppercase font-noto">Full Name</Text>
            <TextInput className="bg-[#141915] text-white rounded-xl p-[14px] border border-[#232D25] mb-4 font-noto" value={name} onChangeText={setName} />
            
            <Text className="text-[#6DA963] text-[12px] font-bold mb-[6px] uppercase font-noto">Job Role</Text>
            <TextInput className="bg-[#141915] text-white rounded-xl p-[14px] border border-[#232D25] mb-4 font-noto" value={job} onChangeText={setJob} />
            
            <Text className="text-[#6DA963] text-[12px] font-bold mb-[6px] uppercase font-noto">Username</Text>
            <TextInput className="bg-[#141915] text-white rounded-xl p-[14px] border border-[#232D25] mb-8 font-noto" value={username} onChangeText={setUsername} />
            
            <Pressable className="bg-[#6DA963] py-4 rounded-xl items-center" onPress={() => setModal(false)}>
              <Text className="font-bold text-[#090D0A] uppercase tracking-[1px] text-[12px] font-noto">Save Details</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  )
}