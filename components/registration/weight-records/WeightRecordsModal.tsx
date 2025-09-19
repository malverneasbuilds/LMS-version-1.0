import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Modal, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from '../../typography/Text';
import { TextField } from '../../inputs/TextField';
import { Picker } from '../../inputs/Picker';
import { DatePicker } from '../../inputs/DatePicker';
import { Button } from '../../ui/Button';
import { X } from 'lucide-react-native';
import Colors from '../../../constants/Colors';
import { useHerd } from '../../../contexts/HerdContext';
import { Plus, Eye, Scale } from 'lucide-react-native';

interface WeightRecord {
  id: string;
  animal_tag: string;
  weight_date: string;
  weight: number;
  notes: string;
}

interface WeightRecordsModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (record: Omit<WeightRecord, 'id'>) => void;
  editRecord?: WeightRecord | null;
  preselectedAnimal?: string;
}

export function WeightRecordsModal({ 
  visible, 
  onClose, 
  onSave, 
  editRecord, 
  preselectedAnimal 
}: WeightRecordsModalProps) {
  const { herdData } = useHerd();
  const [formData, setFormData] = useState({
    animal_tag: '',
    weight_date: null as Date | null,
    weight: 0,
    notes: '',
  });

  const animalOptions = herdData.map(animal => ({
    label: `${animal.tag_number} (${animal.breed}, ${animal.sex})`,
    value: animal.tag_number,
  }));

  useEffect(() => {
    if (editRecord) {
      setFormData({
        animal_tag: editRecord.animal_tag,
        weight_date: new Date(editRecord.weight_date),
        weight: editRecord.weight,
        notes: editRecord.notes,
      });
    } else if (preselectedAnimal) {
      setFormData({
        animal_tag: preselectedAnimal,
        weight_date: new Date(), // Default to today
        weight: 0,
        notes: '',
      });
    } else {
      setFormData({
        animal_tag: '',
        weight_date: new Date(), // Default to today
        weight: 0,
        notes: '',
      });
    }
  }, [editRecord, visible, preselectedAnimal]);

  const handleSave = () => {
    const recordToSave = {
      ...formData,
      weight_date: formData.weight_date?.toISOString().split('T')[0] || '',
    };
    onSave(recordToSave);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text variant="h5" weight="medium">
            {editRecord ? 'Edit Weight Record' : 'Add Weight Record'}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={Colors.neutral[600]} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <Picker
            label="Animal Tag"
            value={formData.animal_tag}
            onValueChange={(value) => setFormData({ ...formData, animal_tag: value })}
            items={animalOptions}
          />

          <DatePicker
            label="Weight Date"
            value={formData.weight_date}
            onDateChange={(date) => setFormData({ ...formData, weight_date: date })}
            placeholder="Select weight date"
          />

          <TextField
            label="Weight (kg)"
            value={formData.weight.toString()}
            onChangeText={(text) => setFormData({ ...formData, weight: parseFloat(text) || 0 })}
            placeholder="Enter weight"
            keyboardType="numeric"
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