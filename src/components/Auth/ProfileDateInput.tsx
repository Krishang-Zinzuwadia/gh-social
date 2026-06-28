import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Platform } from "react-native";
import { CalendarIcon } from "./icons";

let DateTimePicker: any = null;
if (Platform.OS !== 'web') {
  // The native picker must not be loaded into the web bundle.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  DateTimePicker = require('@react-native-community/datetimepicker').default;
}

type ProfileDateInputProps = {
  value: string;
  onChangeText: (text: string) => void;
};

export default function ProfileDateInput({ value, onChangeText }: ProfileDateInputProps) {
  const [date, setDate] = useState(new Date());
  const [show, setShow] = useState(false);

  const onChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShow(Platform.OS === 'ios');
    if (selectedDate) {
        setDate(currentDate);
        const formatted = `${currentDate.getDate().toString().padStart(2, '0')}/${(currentDate.getMonth() + 1).toString().padStart(2, '0')}/${currentDate.getFullYear()}`;
        onChangeText(formatted);
    }
  };

  return (
    <View>
      <Text
        className="text-white text-[15px] mb-3 font-nata"
      >
        Date of Birth
      </Text>

      <TouchableOpacity
        onPress={() => setShow(true)}
        activeOpacity={0.8}
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
          placeholder="DD/MM/YYYY"
          placeholderTextColor="#666"
          className="text-white text-[15px] font-nata flex-1 outline-none"
          value={value}
          editable={false}
          pointerEvents="none"
        />
        <View className="p-2 -mr-2">
          <CalendarIcon size={20} color="#727272" />
        </View>
      </TouchableOpacity>

      {show && Platform.OS !== 'web' && DateTimePicker && (
        <DateTimePicker
          testID="dateTimePicker"
          value={date}
          mode="date"
          display="default"
          onChange={onChange}
          maximumDate={new Date()}
        />
      )}
    </View>
  );
}
