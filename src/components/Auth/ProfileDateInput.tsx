import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { CalendarIcon } from "./icons";
import CustomCalendar from "./CustomCalendar";

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

      <View
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
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#666"
          className="text-white text-[15px] font-nata flex-1 outline-none"
          value={value}
          onChangeText={onChangeText}
          keyboardType="numeric"
          maxLength={10}
        />
        <TouchableOpacity onPress={() => setShow(true)} className="p-2 -mr-2">
          <CalendarIcon size={20} color="#727272" />
        </TouchableOpacity>
      </View>

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
