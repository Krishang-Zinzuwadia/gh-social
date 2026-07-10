import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { CalendarIcon } from "./icons";
import CustomCalendar from "./CustomCalendar";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

type ProfileDateInputProps = {
  value: string;
  onChangeText: (text: string) => void;
};

export default function ProfileDateInput({ value, onChangeText }: ProfileDateInputProps) {
  const [show, setShow] = useState(false);
  
  // Parse the current string value YYYY-MM-DD back to a Date object (if valid)
  const parseDate = (dateStr: string) => {
    if (!dateStr) return new Date();
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const d = parseInt(parts[2], 10);
      return new Date(y, m, d);
    }
    return new Date();
  };

  const selectedDate = parseDate(value);
  const displayValue = value ? `${selectedDate.getDate().toString().padStart(2, '0')} ${MONTHS[selectedDate.getMonth()]} ${selectedDate.getFullYear()}` : "";

  const handleSelectDate = (date: Date) => {
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    onChangeText(`${y}-${m}-${d}`);
  };

  return (
    <View>
      <Text
        className="text-white text-[15px] mb-3 font-nata"
      >
        Date of Birth
      </Text>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setShow(true)}
        className="
          w-full
          h-[56px]
          bg-[#191F18]
          border border-[#8EFF7A]
          rounded-xl
          px-5
          flex-row
          items-center
          justify-between
        "
      >
        <TextInput
          placeholder="DD Month YYYY"
          placeholderTextColor="#666"
          className="text-white text-[15px] font-nata flex-1 outline-none"
          value={displayValue}
          editable={false}
          pointerEvents="none"
        />
        <View className="p-2 -mr-2">
          <CalendarIcon size={20} color="#727272" />
        </View>
      </TouchableOpacity>

      <CustomCalendar
        visible={show}
        onClose={() => setShow(false)}
        selectedDate={selectedDate}
        onSelectDate={handleSelectDate}
        maxDate={new Date()}
      />
    </View>
  );
}
