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
  const [mode, setMode] = useState<'calendar' | 'year' | 'month'>('calendar');

  useEffect(() => {
    if (visible) {
      // Reopening the controlled modal intentionally resets its draft navigation state.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentMonth(selectedDate.getMonth());
      setCurrentYear(selectedDate.getFullYear());
      setMode('calendar');
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
              <TouchableOpacity 
                onPress={() => setMode('month')} 
                style={{ 
                  flexDirection: 'row', 
                  alignItems: 'center', 
                  paddingHorizontal: 12, 
                  paddingVertical: 6, 
                  borderWidth: 1, 
                  borderColor: '#303030', 
                  borderRadius: 8 
                }}
              >
                <Text style={{ color: '#F0F6EB', fontSize: 16, fontWeight: '600', marginRight: 6 }}>
                  {MONTHS[currentMonth]}
                </Text>
                <ChevronDown size={16} color="#8A8A8A" />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setMode('year')} 
                style={{ 
                  flexDirection: 'row', 
                  alignItems: 'center', 
                  paddingHorizontal: 12, 
                  paddingVertical: 6, 
                  borderWidth: 1, 
                  borderColor: '#303030', 
                  borderRadius: 8 
                }}
              >
                <Text style={{ color: '#F0F6EB', fontSize: 16, fontWeight: '600', marginRight: 6 }}>
                  {currentYear}
                </Text>
                <ChevronDown size={16} color="#8A8A8A" />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity onPress={handleNextMonth} style={{ padding: 5 }}>
              <ChevronRightIcon size={24} color="#6DA963" />
            </TouchableOpacity>
          </View>

          {mode === 'calendar' ? (
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
          ) : mode === 'year' ? (
            <View style={{ height: 250 }}>
              <ScrollView showsVerticalScrollIndicator={false}>
                {Array.from({length: 120}, (_, i) => maxDate.getFullYear() - i).map(year => (
                  <TouchableOpacity 
                    key={year} 
                    onPress={() => { setCurrentYear(year); setMode('calendar'); }}
                    style={{ padding: 12, alignItems: 'center' }}
                  >
                    <Text style={{ color: currentYear === year ? '#8EFF7A' : '#F0F6EB', fontSize: 16, fontWeight: currentYear === year ? '700' : '400' }}>{year}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          ) : (
            <View style={{ height: 250 }}>
              <ScrollView showsVerticalScrollIndicator={false}>
                {MONTHS.map((month, index) => (
                  <TouchableOpacity 
                    key={month} 
                    onPress={() => { setCurrentMonth(index); setMode('calendar'); }}
                    style={{ padding: 12, alignItems: 'center' }}
                  >
                    <Text style={{ color: currentMonth === index ? '#8EFF7A' : '#F0F6EB', fontSize: 16, fontWeight: currentMonth === index ? '700' : '400' }}>{month}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
