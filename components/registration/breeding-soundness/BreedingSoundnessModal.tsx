import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Modal, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from '../../typography/Text';
import { TextField } from '../../inputs/TextField';
import { Picker } from '../../inputs/Picker';
import { Button } from '../../ui/Button';
import { X } from 'lucide-react-native';
import Colors from '../../../constants/Colors';
import { useHerd } from '../../../contexts/HerdContext';

interface BreedingSoundnessRecord {
  id: string;
  tag: string;
  age: number;
  pe: string;
  sperm_mortality: string;
  sperm_morphology: number;
  scrotal: number;
  libido: string;
  score: number;
  classification: string;
}

interface BreedingSoundnessModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (record: Omit<BreedingSoundnessRecord, 'id'>) => void;
  editRecord?: BreedingSoundnessRecord | null;
}

const peOptions = [
  { label: 'Poor', value: 'poor' },
  { label: 'Good', value: 'good' },
  { label: 'Excellent', value: 'excellent' },
];

const spermMortalityOptions = [
  { label: 'Poor', value: 'poor' },
  { label: 'Good', value: 'good' },
  { label: 'Excellent', value: 'excellent' },
];

const libidoOptions = [
  { label: 'Poor', value: 'poor' },
  { label: 'Good', value: 'good' },
  { label: 'Excellent', value: 'excellent' },
];

const classificationOptions = [
  { label: 'SPB (Satisfactory Potential Breeder)', value: 'SPB' },
  { label: 'USPB (Un-Satisfactory Potential Breeder)', value: 'USPB' },
  { label: 'CD (Classification Deferred)', value: 'CD' },
];

export function BreedingSoundnessModal({ visible, onClose, onSave, editRecord }: BreedingSoundnessModalProps) {
  const { herdData } = useHerd();
  const [formData, setFormData] = useState({
    tag: '',
    age: 0,
    pe: '',
    sperm_mortality: '',
    sperm_morphology: 0,
    scrotal: 0,
    libido: '',
    score: 0,
    classification: '',
  });

  // Filter herd data to show only male animals for bull breeding soundness
  const bullOptions = herdData
    .filter(animal => animal.sex === 'male')
    .map(animal => ({
      label: `${animal.tag_number} (${animal.breed}, ${animal.age} years)`,
      value: animal.tag_number,
    }));

  useEffect(() => {
    if (editRecord) {
      setFormData({
        tag: editRecord.tag,
        age: editRecord.age,
        pe: editRecord.pe,
        sperm_mortality: editRecord.sperm_mortality,
        sperm_morphology: editRecord.sperm_morphology,
        scrotal: editRecord.scrotal,
        libido: editRecord.libido,
        score: editRecord.score,
        classification: editRecord.classification,
      });
    } else {
      setFormData({
        tag: '',
        age: 0,
        pe: '',
        sperm_mortality: '',
        sperm_morphology: 0,
        scrotal: 0,
        libido: '',
        score: 0,
        classification: '',
      });
    }
  }, [editRecord, visible]);

  const handleTagChange = (selectedTag: string) => {
    const selectedAnimal = herdData.find(animal => animal.tag_number === selectedTag);
    setFormData({
      ...formData,
      tag: selectedTag,
      age: selectedAnimal?.age || 0,
    });
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text variant="h5" weight="medium">
            {editRecord ? 'Edit BSE Record' : 'Add BSE Record'}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={Colors.neutral[600]} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <Picker
            label="Bull Tag"
            value={formData.tag}
            onValueChange={handleTagChange}
            items={bullOptions}
          />

          <TextField
            label="Age (years)"
            value={formData.age.toString()}
            onChangeText={(text) => setFormData({ ...formData, age: parseInt(text) || 0 })}
            placeholder="Age will be auto-filled"
            keyboardType="numeric"
            editable={false}
          />

          <Picker
            label="Physical Examination (PE)"
            value={formData.pe}
            onValueChange={(value) => setFormData({ ...formData, pe: value })}
            items={peOptions}
          />

          <Picker
            label="Sperm Mortality"
            value={formData.sperm_mortality}
            onValueChange={(value) => setFormData({ ...formData, sperm_mortality: value })}
            items={spermMortalityOptions}
          />

          <TextField
            label="Sperm Morphology (%)"
            value={formData.sperm_morphology.toString()}
            onChangeText={(text) => setFormData({ ...formData, sperm_morphology: parseFloat(text) || 0 })}
            placeholder="Enter percentage"
            keyboardType="numeric"
          />

          <TextField
            label="Scrotal (cm)"
            value={formData.scrotal.toString()}
            onChangeText={(text) => setFormData({ ...formData, scrotal: parseFloat(text) || 0 })}
            placeholder="Enter scrotal circumference"
            keyboardType="numeric"
          />

          <Picker
            label="Libido"
            value={formData.libido}
            onValueChange={(value) => setFormData({ ...formData, libido: value })}
            items={libidoOptions}
          />

          <TextField
            label="Score"
            value={formData.score.toString()}
            onChangeText={(text) => setFormData({ ...formData, score: parseFloat(text) || 0 })}
            placeholder="Enter overall score"
            keyboardType="numeric"
          />

          <Picker
            label="Classification"
            value={formData.classification}
            onValueChange={(value) => setFormData({ ...formData, classification: value })}
            items={classificationOptions}
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