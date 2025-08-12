import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Modal, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from '../../typography/Text';
import { TextField } from '../../inputs/TextField';
import { Picker } from '../../inputs/Picker';
import { Button } from '../../ui/Button';
import { X } from 'lucide-react-native';
import Colors from '../../../constants/Colors';

interface HerdRecord {
  id: string;
  tag_number: string;
  breed: string;
  date_of_birth: string;
  sex: string;
}

interface HerdRegisterModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (record: Omit<HerdRecord, 'id'>) => void;
  editRecord?: HerdRecord | null;
}

const breedOptions = [
  { label: 'Brahman', value: 'brahman' },
  { label: 'Mashona', value: 'mashona' },
  { label: 'Ankole', value: 'ankole' },
  { label: 'Cross', value: 'cross' },
];

const sexOptions = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
];

const statusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Sold', value: 'sold' },
  { label: 'Deceased', value: 'deceased' },
];

export function HerdRegisterModal({ visible, onClose, onSave, editRecord }: HerdRegisterModalProps) {
  const [formData, setFormData] = useState({
    tag_number: '',
    breed: '',
    date_of_birth: '',
    sex: '',
  });

  useEffect(() => {
    if (editRecord) {
      setFormData({
        tag_number: editRecord.tag_number,
        breed: editRecord.breed,
        date_of_birth: editRecord.date_of_birth,
        sex: editRecord.sex,
      });
    } else {
      setFormData({
        tag_number: '',
        breed: '',
        date_of_birth: '',
        sex: '',
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
            {editRecord ? 'Edit Animal' : 'Add New Animal'}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={Colors.neutral[600]} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <TextField
            label="Tag Number"
            value={formData.tag_number}
            onChangeText={(text) => setFormData({ ...formData, tag_number: text })}
            placeholder="Enter tag number"
          />

          <Picker
            label="Breed"
            value={formData.breed}
            onValueChange={(value) => setFormData({ ...formData, breed: value })}
            items={breedOptions}
          />

          <TextField
            label="Date of Birth"
            value={formData.date_of_birth}
            onChangeText={(text) => setFormData({ ...formData, date_of_birth: text })}
            placeholder="YYYY-MM-DD"
          />

          <Picker
            label="Sex"
            value={formData.sex}
            onValueChange={(value) => setFormData({ ...formData, sex: value })}
            items={sexOptions}
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