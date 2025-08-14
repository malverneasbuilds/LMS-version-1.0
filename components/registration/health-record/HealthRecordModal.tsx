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

interface HealthRecord {
  id: string;
  date: string;
  event_type: string;
  event: string;
  tag: string;
  diagnosis: string;
  treatment: string;
  drug_administering: string;
  special_notes: string;
  done_by: string;
}

interface HealthRecordModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (record: Omit<HealthRecord, 'id'>) => void;
  editRecord?: HealthRecord | null;
}

const eventTypeOptions = [
  { label: 'Mass', value: 'mass' },
  { label: 'Individual', value: 'individual' },
];

export function HealthRecordModal({ visible, onClose, onSave, editRecord }: HealthRecordModalProps) {
  const { herdData } = useHerd();
  const [formData, setFormData] = useState({
    date: '',
    event_type: '',
    event: '',
    tag: '',
    diagnosis: '',
    treatment: '',
    drug_administering: '',
    special_notes: '',
    done_by: '',
  });

  const animalOptions = herdData.map(animal => ({
    label: `${animal.tag_number} (${animal.breed}, ${animal.sex})`,
    value: animal.tag_number,
  }));

  useEffect(() => {
    if (editRecord) {
      setFormData({
        date: editRecord.date,
        event_type: editRecord.event_type,
        event: editRecord.event,
        tag: editRecord.tag,
        diagnosis: editRecord.diagnosis,
        treatment: editRecord.treatment,
        drug_administering: editRecord.drug_administering,
        special_notes: editRecord.special_notes,
        done_by: editRecord.done_by,
      });
    } else {
      setFormData({
        date: '',
        event_type: '',
        event: '',
        tag: '',
        diagnosis: '',
        treatment: '',
        drug_administering: '',
        special_notes: '',
        done_by: '',
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
            {editRecord ? 'Edit Health Record' : 'Add Health Record'}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={Colors.neutral[600]} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <DateTimePickerComponent
            label="Date"
            value={formData.date}
            onDateChange={(date) => setFormData({ ...formData, date: date })}
            placeholder="Select date"
          />

          <Picker
            label="Event Type"
            value={formData.event_type}
            onValueChange={(value) => setFormData({ ...formData, event_type: value })}
            items={eventTypeOptions}
          />

          <TextField
            label="Event"
            value={formData.event}
            onChangeText={(text) => setFormData({ ...formData, event: text })}
            placeholder="Enter event description"
          />

          {formData.event_type === 'individual' && (
            <Picker
              label="Animal Tag"
              value={formData.tag}
              onValueChange={(value) => setFormData({ ...formData, tag: value })}
              items={animalOptions}
            />
          )}

          {formData.event_type === 'mass' && (
            <TextField
              label="Animal Tags (optional)"
              value={formData.tag}
              onChangeText={(text) => setFormData({ ...formData, tag: text })}
              placeholder="Enter tags separated by commas (optional for mass events)"
            />
          )}

          <TextField
            label="Diagnosis"
            value={formData.diagnosis}
            onChangeText={(text) => setFormData({ ...formData, diagnosis: text })}
            placeholder="Enter diagnosis"
          />

          <TextField
            label="Treatment"
            value={formData.treatment}
            onChangeText={(text) => setFormData({ ...formData, treatment: text })}
            placeholder="Enter treatment"
          />

          <TextField
            label="Drug Administering"
            value={formData.drug_administering}
            onChangeText={(text) => setFormData({ ...formData, drug_administering: text })}
            placeholder="Enter drug administered"
          />

          <TextField
            label="Special Notes"
            value={formData.special_notes}
            onChangeText={(text) => setFormData({ ...formData, special_notes: text })}
            placeholder="Enter special notes"
            multiline
            numberOfLines={3}
          />

          <TextField
            label="Done By"
            value={formData.done_by}
            onChangeText={(text) => setFormData({ ...formData, done_by: text })}
            placeholder="Enter person responsible"
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