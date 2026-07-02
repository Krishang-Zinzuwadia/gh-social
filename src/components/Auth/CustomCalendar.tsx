import React, { useState, useMemo, useEffect } from "react";
import { View, Text, TouchableOpacity, Modal, ScrollView } from "react-native";
import { ChevronRightIcon } from "./icons";
import { ChevronLeft, ChevronDown } from "lucide-react-native";

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
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  useEffect(() => {
    if (visible) {
      setCurrentMonth(selectedDate.getMonth());
      setCurrentYear(selectedDate.getFullYear());
      setShowYearPicker(false);
      setShowMonthPicker(false);
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
            
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {/* Month Dropdown Button */}
              <TouchableOpacity 
                onPress={() => { setShowMonthPicker(!showMonthPicker); setShowYearPicker(false); }}
                style={{
                  flexDirection: 'row', alignItems: 'center',
                  borderWidth: 1, borderColor: '#303030', borderRadius: 8,
                  paddingHorizontal: 10, paddingVertical: 6, gap: 4,
                  backgroundColor: showMonthPicker ? '#303030' : 'transparent'
                }}
              >
                <Text style={{ color: '#F0F6EB', fontSize: 14, fontWeight: '600' }}>
                  {MONTHS[currentMonth].substring(0, 3)}
                </Text>
                <ChevronDown size={14} color="#F0F6EB" />
              </TouchableOpacity>

              {/* Year Dropdown Button */}
              <TouchableOpacity 
                onPress={() => { setShowYearPicker(!showYearPicker); setShowMonthPicker(false); }}
                style={{
                  flexDirection: 'row', alignItems: 'center',
                  borderWidth: 1, borderColor: '#303030', borderRadius: 8,
                  paddingHorizontal: 10, paddingVertical: 6, gap: 4,
                  backgroundColor: showYearPicker ? '#303030' : 'transparent'
                }}
              >
                <Text style={{ color: '#F0F6EB', fontSize: 14, fontWeight: '600' }}>
                  {currentYear}
                </Text>
                <ChevronDown size={14} color="#F0F6EB" />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity onPress={handleNextMonth} style={{ padding: 5 }}>
              <ChevronRightIcon size={24} color="#6DA963" />
            </TouchableOpacity>
          </View>

          {showMonthPicker ? (
            <View style={{ height: 260 }}>
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {MONTHS.map((month, index) => (
                    <TouchableOpacity
                      key={month}
                      onPress={() => {
                        setCurrentMonth(index);
                        setShowMonthPicker(false);
                      }}
                      style={{
                        width: '30%',
                        paddingVertical: 12,
                        alignItems: 'center',
                        backgroundColor: currentMonth === index ? '#6DA963' : 'transparent',
                        borderRadius: 8,
                        margin: '1.5%'
                      }}
                    >
                      <Text style={{ 
                        color: currentMonth === index ? '#000' : '#F0F6EB', 
                        fontWeight: currentMonth === index ? '700' : '500',
                        fontSize: 15
                      }}>
                        {month.substring(0, 3)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          ) : showYearPicker ? (
            <View style={{ height: 260 }}>
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                    <TouchableOpacity
                      key={year}
                      onPress={() => {
                        setCurrentYear(year);
                        setShowYearPicker(false);
                      }}
                      style={{
                        width: '30%',
                        paddingVertical: 12,
                        alignItems: 'center',
                        backgroundColor: currentYear === year ? '#6DA963' : 'transparent',
                        borderRadius: 8,
                        margin: '1.5%'
                      }}
                    >
                      <Text style={{ 
                        color: currentYear === year ? '#000' : '#F0F6EB', 
                        fontWeight: currentYear === year ? '700' : '500',
                        fontSize: 15
                      }}>
                        {year}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          ) : (
            <>
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
            </>
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
