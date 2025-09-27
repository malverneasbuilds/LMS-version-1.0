import React, { useState } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Pressable, ScrollView } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { Text } from '../typography/Text';
import Colors from '../../constants/Colors';

interface BCSPickerProps {
  label: string;
  value: number;
  onValueChange: (value: number) => void;
  style?: any;
}

export function BCSPicker({ label, value, onValueChange, style }: BCSPickerProps) {
  const [modalVisible, setModalVisible] = useState(false);

  // Generate BCS options from 1.0 to 5.0 with 0.25 increments
  const bcsOptions = [];
  for (let i = 1.0; i <= 5.0; i += 0.25) {
    const roundedValue = Math.round(i * 4) / 4; // Ensure precise 0.25 increments
    bcsOptions.push({
      label: roundedValue.toFixed(2),
      value: roundedValue,
    });
  }

  const selectedOption = bcsOptions.find(option => option.value === value);

  return (
    <View style={[styles.container, style]}>
      <Text variant="body2" color="neutral.600" style={styles.label}>
        {label}
      </Text>
      <TouchableOpacity
        style={styles.pickerContainer}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <Text style={styles.selectedText}>
          {selectedOption?.label || '3.00'}
        </Text>
        <ChevronDown size={20} color={Colors.neutral[400]} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text variant="h6" weight="medium">{label}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text variant="body2" color="primary.500">Done</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.optionsContainer}>
              {bcsOptions.map((option, index) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.option,
                    index === bcsOptions.length - 1 && styles.lastOption,
                    option.value === value && styles.selectedOption
                  ]}
                  onPress={() => {
                    onValueChange(option.value);
                    setModalVisible(false);
                  }}
                >
                  <Text
                    variant="body"
                    color={option.value === value ? 'primary.500' : 'neutral.900'}
                    weight={option.value === value ? 'medium' : 'regular'}
                  >
                    {option.label}
                  </Text>
                  <Text variant="caption" color="neutral.500" style={styles.description}>
                    {getBCSDescription(option.value)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

// Helper function to get BCS description
function getBCSDescription(score: number): string {
  if (score <= 1.5) return 'Very thin - ribs easily visible';
  if (score <= 2.5) return 'Thin - ribs easily felt';
  if (score <= 3.5) return 'Moderate - ideal condition';
  if (score <= 4.5) return 'Fat - ribs hard to feel';
  return 'Very fat - obese condition';
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 4,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    borderRadius: 8,
    backgroundColor: Colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    height: 48,
  },
  selectedText: {
    fontSize: 16,
    color: Colors.neutral[900],
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    maxHeight: '80%',
    width: '100%',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  optionsContainer: {
    maxHeight: 300,
  },
  option: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  lastOption: {
    borderBottomWidth: 0,
  },
  selectedOption: {
    backgroundColor: Colors.primary[50],
  },
  description: {
    marginTop: 2,
  },
});