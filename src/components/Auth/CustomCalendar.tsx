import React, { useState, useMemo, useEffect } from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import { ChevronRightIcon } from "./icons";
import { ChevronLeft } from "lucide-react-native";

type CustomCalendarProps = {
  visible: boolean;
  onClose: () => void;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  maxDate?: Date;
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const DAYS = ["S", "M", "T", "W", "T", "F", "S"];

export default function CustomCalendar({
  visible,
  onClose,
  selectedDate,
  onSelectDate,
  maxDate = new Date(),
}: CustomCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate.getMonth());
  const [currentYear, setCurrentYear] = useState(selectedDate.getFullYear());

  useEffect(() => {
    if (visible) {
      setCurrentMonth(selectedDate.getMonth());
      setCurrentYear(selectedDate.getFullYear());
    }
  }, [visible, selectedDate]);

  const daysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const startDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const calendarDays = useMemo(() => {
    const totalDays = daysInMonth(currentMonth, currentYear);
    const startDay = startDayOfMonth(currentMonth, currentYear);
    
    const daysArray = [];
    for (let i = 0; i < startDay; i++) {
      daysArray.push(null);
    }
    for (let i = 1; i <= totalDays; i++) {
      daysArray.push(new Date(currentYear, currentMonth, i));
    }
    return daysArray;
  }, [currentMonth, currentYear]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handleSelect = (date: Date) => {
    if (maxDate && date > maxDate) return;
    onSelectDate(date);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        activeOpacity={1} 
        onPress={onClose} 
        style={{
          flex: 1, 
          backgroundColor: 'rgba(0, 0, 0, 0.6)', 
          justifyContent: 'center', 
          alignItems: 'center'
        }}
      >
        <TouchableOpacity 
          activeOpacity={1}
          style={{
            width: 320,
            backgroundColor: "#191F18",
            borderRadius: 16,
            padding: 20,
            borderWidth: 1,
            borderColor: "#303030",
          }}
        >
          {/* Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <TouchableOpacity onPress={handlePrevMonth} style={{ padding: 5 }}>
              <ChevronLeft size={24} color="#6DA963" />
            </TouchableOpacity>
            
            <Text style={{ color: '#F0F6EB', fontSize: 16, fontWeight: '600' }}>
              {MONTHS[currentMonth]} {currentYear}
            </Text>
            
            <TouchableOpacity onPress={handleNextMonth} style={{ padding: 5 }}>
              <ChevronRightIcon size={24} color="#6DA963" />
            </TouchableOpacity>
          </View>

          {/* Days of Week */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
            {DAYS.map((day, index) => (
              <Text key={`day-${index}`} style={{ color: '#8A8A8A', width: 32, textAlign: 'center', fontWeight: '500' }}>
                {day}
              </Text>
            ))}
          </View>

          {/* Grid */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {calendarDays.map((dateObj, index) => {
              if (!dateObj) {
                return <View key={`empty-${index}`} style={{ width: `${100/7}%`, height: 40 }} />;
              }

              const isSelected = 
                selectedDate.getDate() === dateObj.getDate() &&
                selectedDate.getMonth() === dateObj.getMonth() &&
                selectedDate.getFullYear() === dateObj.getFullYear();
              
              const isFuture = maxDate && dateObj > maxDate;

              return (
                <TouchableOpacity
                  key={`date-${index}`}
                  disabled={isFuture}
                  onPress={() => handleSelect(dateObj)}
                  style={{
                    width: `${100/7}%`,
                    height: 40,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <View style={{
                    width: 32,
                    height: 32,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: isSelected ? '#6DA963' : 'transparent',
                    borderRadius: 16,
                  }}>
                    <Text style={{ 
                      color: isFuture ? '#444' : (isSelected ? '#000' : '#F0F6EB'), 
                      fontWeight: isSelected ? '700' : '400' 
                    }}>
                      {dateObj.getDate()}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
