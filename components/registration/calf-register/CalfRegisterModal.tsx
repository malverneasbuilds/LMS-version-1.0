import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Modal, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from '../../typography/Text';
import { TextField } from '../../inputs/TextField';
import { Picker } from '../../inputs/Picker';
import { Button } from '../../ui/Button';
import { X } from 'lucide-react-native';
import Colors from '../../../constants/Colors';
import { useHerd } from '../../../contexts/HerdContext';

interface CalfRecord {
  id: string;
  tag_number: string;
  age: number;
  sex: string;
  birth_weight: number;
  weaning_weight: number;
  weaning_date: string;
}

interface CalfRegisterModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (record: Omit<CalfRecord, 'id'>) => void;
  editRecord?: CalfRecord | null;
}

const sexOptions = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
];

export function CalfRegisterModal({ visible, onClose, onSave, editRecord }: CalfRegisterModalProps) {
  const { herdData } = useHerd();
  const [formData, setFormData] = useState({
    parent_tag: '',
    age: 0,
    sex: '',
    birth_weight: 0,
    weaning_weight: 0,
    weaning_date: '',
  });

  // Create options for parent animals (only females for calves)
  const parentOptions = herdData
    .filter(animal => animal.sex === 'female')
    .map(animal => ({
      label: `${animal.tag_number} (${animal.breed})`,
      value: animal.tag_number,
    }));

  useEffect(() => {
    if (editRecord) {
      setFormData({
        parent_tag: editRecord.tag_number,
        age: editRecord.age,
        sex: editRecord.sex,
        birth_weight: editRecord.birth_weight,
        weaning_weight: editRecord.weaning_weight,
        weaning_date: editRecord.weaning_date,
      });
    } else {
      setFormData({
        parent_tag: '',
        age: 0,
        sex: '',
        birth_weight: 0,
        weaning_weight: 0,
        weaning_date: '',
      });
    }
  }, [editRecord, visible]);

  const generateCalfTag = (parentTag: string) => {
    const timestamp = Date.now().toString().slice(-4);
    return `${parentTag}-C${timestamp}`;
  };

  const handleSave = () => {
    const calfTag = generateCalfTag(formData.parent_tag);
    onSave({
      ...formData,
      tag_number: calfTag,
    });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text variant="h5" weight="medium">
            {editRecord ? 'Edit Calf Record' : 'Add New Calf'}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={Colors.neutral[600]} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <Picker
            label="Parent Animal"
            value={formData.parent_tag}
            onValueChange={(value) => setFormData({ ...formData, parent_tag: value })}
            items={parentOptions}
          />

          <TextField
            label="Age (months)"
            value={formData.age.toString()}
            onChangeText={(text) => setFormData({ ...formData, age: parseInt(text) || 0 })}
            placeholder="Enter age in months"
            keyboardType="numeric"
          />

          <Picker
            label="Sex"
            value={formData.sex}
            onValueChange={(value) => setFormData({ ...formData, sex: value })}
            items={sexOptions}
          />

          <TextField
            label="Birth Weight (kg)"
            value={formData.birth_weight.toString()}
            onChangeText={(text) => setFormData({ ...formData, birth_weight: parseFloat(text) || 0 })}
            placeholder="Enter birth weight"
            keyboardType="numeric"
          />

          <TextField
            label="Weaning Weight (kg)"
            value={formData.weaning_weight.toString()}
            onChangeText={(text) => setFormData({ ...formData, weaning_weight: parseFloat(text) || 0 })}
            placeholder="Enter weaning weight"
            keyboardType="numeric"
          />

          <TextField
            label="Weaning Date"
            value={formData.weaning_date}
            onChangeText={(text) => setFormData({ ...formData, weaning_date: text })}
            placeholder="YYYY-MM-DD"
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