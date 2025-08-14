import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Modal, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from '../../typography/Text';
import { TextField } from '../../inputs/TextField';
import { DateTimePickerComponent } from '../../inputs/DateTimePicker';
import { Picker } from '../../inputs/Picker';
import { Button } from '../../ui/Button';
import { X } from 'lucide-react-native';
import Colors from '../../../constants/Colors';
import { useHerd } from '../../../contexts/HerdContext';

interface MortalityRecord {
  id: string;
  animal_tag: string;
  date_of_event: string;
  event_type: string;
  cause: string;
  weight: number;
  value: number;
  disposal_method: string;
  notes: string;
}

interface MortalityRegisterModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (record: Omit<MortalityRecord, 'id'>) => void;
  editRecord?: MortalityRecord | null;
}

const eventTypeOptions = [
  { label: 'Death', value: 'death' },
  { label: 'Cull', value: 'cull' },
  { label: 'Emergency Slaughter', value: 'emergency_slaughter' },
];

const disposalMethodOptions = [
  { label: 'Burial', value: 'burial' },
  { label: 'Burning', value: 'burning' },
  { label: 'Rendering', value: 'rendering' },
  { label: 'Veterinary Disposal', value: 'veterinary_disposal' },
];

export function MortalityRegisterModal({ visible, onClose, onSave, editRecord }: MortalityRegisterModalProps) {
  const { herdData } = useHerd();
  const [formData, setFormData] = useState({
    animal_tag: '',
    date_of_event: '',
    event_type: '',
    cause: '',
    weight: 0,
    value: 0,
    disposal_method: '',
    notes: '',
  });

  // Create options for animals from herd register
  const animalOptions = herdData.map(animal => ({
    label: `${animal.tag_number} (${animal.breed}, ${animal.sex})`,
    value: animal.tag_number,
  }));

  useEffect(() => {
    if (editRecord) {
      setFormData({
        animal_tag: editRecord.animal_tag,
        date_of_event: editRecord.date_of_event,
        event_type: editRecord.event_type,
        cause: editRecord.cause,
        weight: editRecord.weight,
        value: editRecord.value,
        disposal_method: editRecord.disposal_method,
        notes: editRecord.notes,
      });
    } else {
      setFormData({
        animal_tag: '',
        date_of_event: '',
        event_type: '',
        cause: '',
        weight: 0,
        value: 0,
        disposal_method: '',
        notes: '',
      });
    }
  }, [editRecord, visible]);

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text variant="h5" weight="medium">
            {editRecord ? 'Edit Mortality Record' : 'Add Mortality Record'}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={Colors.neutral[600]} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <Picker
            label="Animal"
            value={formData.animal_tag}
            onValueChange={(value) => setFormData({ ...formData, animal_tag: value })}
            items={animalOptions}
          />

          <TextField
            label="Date of Event"
            value={formData.date_of_event}
            onChangeText={(text) => setFormData({ ...formData, date_of_event: text })}
            placeholder="YYYY-MM-DD"
          />
          <DateTimePickerComponent
            label="Date of Event"
            value={formData.date_of_event}
            onDateChange={(date) => setFormData({ ...formData, date_of_event: date })}
            placeholder="Select event date"
          />

          <Picker
            label="Event Type"
            value={formData.event_type}
            onValueChange={(value) => setFormData({ ...formData, event_type: value })}
            items={eventTypeOptions}
          />

          <TextField
            label="Cause"
            value={formData.cause}
            onChangeText={(text) => setFormData({ ...formData, cause: text })}
            placeholder="Enter cause of death/culling"
          />

          <TextField
            label="Weight (kg)"
            value={formData.weight.toString()}
            onChangeText={(text) => setFormData({ ...formData, weight: parseFloat(text) || 0 })}
            placeholder="Enter weight"
            keyboardType="numeric"
          />

          <TextField
            label="Value ($)"
            value={formData.value.toString()}
            onChangeText={(text) => setFormData({ ...formData, value: parseFloat(text) || 0 })}
            placeholder="Enter estimated value"
            keyboardType="numeric"
          />

          <Picker
            label="Disposal Method"
            value={formData.disposal_method}
            onValueChange={(value) => setFormData({ ...formData, disposal_method: value })}
            items={disposalMethodOptions}
          />

          <TextField
            label="Notes"
            value={formData.notes}
            onChangeText={(text) => setFormData({ ...formData, notes: text })}
            placeholder="Enter additional notes"
            multiline
            numberOfLines={3}
          />
        </ScrollView>

        <View style={styles.footer}>
          <Button variant="outline" onPress={onClose} style={styles.button}>
            Cancel
          </Button>
          <Button variant="primary" onPress={handleSave} style={styles.button}>
            {editRecord ? 'Update' : 'Save'}
          </Button>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
  },
  button: {
    flex: 1,
  },
});