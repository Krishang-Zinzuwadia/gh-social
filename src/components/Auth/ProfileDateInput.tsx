import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Platform } from "react-native";
import DateTimePicker from '@react-native-community/datetimepicker';
import { CalendarIcon } from "./icons";

export default function ProfileDateInput() {
  const [date, setDate] = useState(new Date());
  const [show, setShow] = useState(false);
  const [hasSelected, setHasSelected] = useState(false);

  const onChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShow(Platform.OS === 'ios');
    if (selectedDate) {
        setDate(currentDate);
        setHasSelected(true);
    }
  };

  const formattedDate = hasSelected 
    ? `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear().toString().slice(-2)}`
    : "";

  return (
    <View>
      <Text
        className="text-white text-[15px] mb-3 font-nata"
      >
        Date of Birth
      </Text>

      <TouchableOpacity
        onPress={() => setShow(true)}
        className="
          w-full
          h-[56px]
          bg-[#191F18]
          border border-[#6DA963]
          rounded-xl
          px-5
          flex-row
          items-center
          justify-between
        "
      >
        <TextInput
          placeholder="DD/MM/YY"
          placeholderTextColor="#666"
          className="text-white text-[15px] font-nata flex-1 outline-none"
          editable={false}
          value={formattedDate}
          pointerEvents="none"
        />
        <CalendarIcon size={20} color="#727272" />
      </TouchableOpacity>

      {show && (
        <DateTimePicker
          testID="dateTimePicker"
          value={date}
          mode="date"
          display="default"
          onChange={onChange}
        />
      )}
    </View>
  );
}