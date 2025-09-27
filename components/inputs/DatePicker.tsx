import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform, TextInput } from 'react-native';
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

  const handleWebDateChange = (dateString: string) => {
    if (dateString) {
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        onDateChange(date);
      }
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  };

  const formatDisplayDate = (date: Date | null) => {
    if (!date) return placeholder;
    return date.toLocaleDateString();
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text variant="body2" color="neutral.700" style={styles.label}>
          {label}
        </Text>
      )}
      
      {Platform.OS === 'web' ? (
        // Web-specific date input
        <View style={[styles.inputContainer, error && styles.error]}>
          <View style={styles.iconContainer}>
            <Calendar size={20} color={Colors.neutral[500]} />
          </View>
          <TextInput
            style={styles.webDateInput}
            value={formatDate(value)}
            onChangeText={handleWebDateChange}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={Colors.neutral[400]}
          />
        </View>
      ) : (
        // Native date picker
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
            {formatDisplayDate(value)}
          </Text>
        </TouchableOpacity>
      )}

      {error && (
        <Text variant="caption" color="error.500" style={styles.errorText}>
          {error}
        </Text>
      )}

      {showPicker && Platform.OS !== 'web' && (
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
  webDateInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.neutral[800],
    paddingRight: 16,
    paddingVertical: 16,
    outlineStyle: 'none',
    border: 'none',
    backgroundColor: 'transparent',
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