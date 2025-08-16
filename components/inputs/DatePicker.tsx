import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar } from 'lucide-react-native';
import { Text } from '../typography/Text';
import Colors from '../../constants/Colors';

interface DatePickerProps {
  label?: string;
  value: Date | null;
  onDateChange: (date: Date) => void;
  placeholder?: string;
  error?: string;
  containerStyle?: any;
}

export function DatePicker({ 
  label, 
  value, 
  onDateChange, 
  placeholder = 'Select date',
  error,
  containerStyle 
}: DatePickerProps) {
  const [showPicker, setShowPicker] = useState(false);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    
    if (selectedDate) {
      onDateChange(selectedDate);
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return placeholder;
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
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
        onPress={() => setShowPicker(true)}
      >
        <View style={styles.iconContainer}>
          <Calendar size={20} color={Colors.neutral[500]} />
        </View>
        <Text 
          style={[
            styles.dateText,
            !value && styles.placeholderText
          ]}
        >
          {formatDate(value)}
        </Text>
      </TouchableOpacity>

      {error && (
        <Text variant="caption" color="error.500" style={styles.errorText}>
          {error}
        </Text>
      )}

      {showPicker && (
        <DateTimePicker
          value={value || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          style={Platform.OS === 'ios' ? styles.iosPicker : undefined}
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
    borderWidth: 1,
    borderColor: Colors.neutral[300],
    borderRadius: 12,
    backgroundColor: Colors.white,
    minHeight: 52,
  },
  error: {
    borderColor: Colors.error[500],
  },
  iconContainer: {
    paddingHorizontal: 12,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    color: Colors.neutral[800],
    paddingRight: 16,
  },
  placeholderText: {
    color: Colors.neutral[400],
  },
  errorText: {
    marginTop: 4,
  },
  iosPicker: {
    backgroundColor: Colors.white,
  },
});