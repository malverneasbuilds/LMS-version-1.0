import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar } from 'lucide-react-native';
import { Text } from '../typography/Text';
import Colors from '../../constants/Colors';

interface DateTimePickerProps {
  label: string;
  value: string;
  onDateChange: (date: string) => void;
  placeholder?: string;
  containerStyle?: any;
  error?: string;
}

export function DateTimePickerComponent({ 
  label, 
  value, 
  onDateChange, 
  placeholder = 'Select date',
  containerStyle,
  error 
}: DateTimePickerProps) {
  const [show, setShow] = useState(false);
  const [date, setDate] = useState(value ? new Date(value) : new Date());

  const onChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShow(Platform.OS === 'ios');
    setDate(currentDate);
    
    // Format date as YYYY-MM-DD
    const formattedDate = currentDate.toISOString().split('T')[0];
    onDateChange(formattedDate);
  };

  const showDatepicker = () => {
    setShow(true);
  };

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return placeholder;
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text variant="body2" color="neutral.700" style={styles.label}>
          {label}
        </Text>
      )}
      
      <TouchableOpacity
        style={[
          styles.inputContainer,
          error && styles.error,
        ]}
        onPress={showDatepicker}
        activeOpacity={0.7}
      >
        <Text 
          style={[
            styles.dateText,
            !value && styles.placeholderText
          ]}
        >
          {formatDisplayDate(value)}
        </Text>
        <Calendar size={20} color={Colors.neutral[500]} />
      </TouchableOpacity>

      {error && (
        <Text variant="caption" color="error.500" style={styles.errorText}>
          {error}
        </Text>
      )}

      {show && (
        <DateTimePicker
          testID="dateTimePicker"
          value={date}
          mode="date"
          is24Hour={true}
          display="default"
          onChange={onChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.neutral[300],
    borderRadius: 12,
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    height: 48,
  },
  error: {
    borderColor: Colors.error[500],
  },
  dateText: {
    fontSize: 16,
    color: Colors.neutral[800],
    flex: 1,
  },
  placeholderText: {
    color: Colors.neutral[400],
  },
  errorText: {
    marginTop: 4,
  },
});