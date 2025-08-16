import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Modal, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from '../../typography/Text';
import { TextField } from '../../inputs/TextField';
import { Picker } from '../../inputs/Picker';
import { Button } from '../../ui/Button';
import { X } from 'lucide-react-native';
import Colors from '../../../constants/Colors';
import { useHerd } from '../../../contexts/HerdContext';

interface HeatDetectionRecord {
  id: string;
  tag: string;
  stock_type: string;
  body_condition_score: number;
  heat_detection_date: string;
  observer: string;
  serviced_date: string;
  breeding_status: string;
  breeding_method: string;
  ai_technician: string;
  sire_id_straw_id: string;
  semen_viability: string;
  return_to_heat_date_1: string;
  date_served: string;
  breeding_method_2: string;
  sire_used: string;
  return_to_heat_date_2: string;
}

interface HeatDetectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (record: Omit<HeatDetectionRecord, 'id'>) => void;
  editRecord?: HeatDetectionRecord | null;
}

const stockTypeOptions = [
  { label: 'Heifer', value: 'heifer' },
  { label: 'Cow', value: 'cow' },
  { label: 'Bull', value: 'bull' },
];

const breedingStatusOptions = [
  { label: 'Served', value: 'served' },
  { label: 'Not Served', value: 'not_served' },
  { label: 'Pregnant', value: 'pregnant' },
  { label: 'Open', value: 'open' },
];

const breedingMethodOptions = [
  { label: 'Natural Service', value: 'natural_service' },
  { label: 'Artificial Insemination', value: 'artificial_insemination' },
];

export function HeatDetectionModal({ visible, onClose, onSave, editRecord }: HeatDetectionModalProps) {
  const { herdData } = useHerd();
  const [formData, setFormData] = useState({
    tag: '',
    stock_type: '',
    body_condition_score: 0,
    heat_detection_date: '',
    observer: '',
    serviced_date: '',
    breeding_status: '',
    breeding_method: '',
    ai_technician: '',
    sire_id_straw_id: '',
    semen_viability: '',
    return_to_heat_date_1: '',
    date_served: '',
    breeding_method_2: '',
    sire_used: '',
    return_to_heat_date_2: '',
  });

  // Filter for female animals only
  const femaleAnimalOptions = herdData
    .filter(animal => animal.sex === 'female')
    .map(animal => ({
      label: `${animal.tag_number} (${animal.breed}, ${animal.age} years)`,
      value: animal.tag_number,
    }));

  // Filter for male animals (bulls/sires)
  const maleAnimalOptions = herdData
    .filter(animal => animal.sex === 'male')
    .map(animal => ({
      label: `${animal.tag_number} (${animal.breed}, ${animal.age} years)`,
      value: animal.tag_number,
    }));

  useEffect(() => {
    if (editRecord) {
      setFormData({
        tag: editRecord.tag,
        stock_type: editRecord.stock_type,
        body_condition_score: editRecord.body_condition_score,
        heat_detection_date: editRecord.heat_detection_date,
        observer: editRecord.observer,
        serviced_date: editRecord.serviced_date,
        breeding_status: editRecord.breeding_status,
        breeding_method: editRecord.breeding_method,
        ai_technician: editRecord.ai_technician,
        sire_id_straw_id: editRecord.sire_id_straw_id,
        semen_viability: editRecord.semen_viability,
        return_to_heat_date_1: editRecord.return_to_heat_date_1,
        date_served: editRecord.date_served,
        breeding_method_2: editRecord.breeding_method_2,
        sire_used: editRecord.sire_used,
        return_to_heat_date_2: editRecord.return_to_heat_date_2,
      });
    } else {
      setFormData({
        tag: '',
        stock_type: '',
        body_condition_score: 0,
        heat_detection_date: '',
        observer: '',
        serviced_date: '',
        breeding_status: '',
        breeding_method: '',
        ai_technician: '',
        sire_id_straw_id: '',
        semen_viability: '',
        return_to_heat_date_1: '',
        date_served: '',
        breeding_method_2: '',
        sire_used: '',
        return_to_heat_date_2: '',
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
            {editRecord ? 'Edit Heat Detection Record' : 'Add Heat Detection Record'}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={Colors.neutral[600]} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <Picker
            label="Animal Tag"
            value={formData.tag}
            onValueChange={(value) => setFormData({ ...formData, tag: value })}
            items={femaleAnimalOptions}
          />

          <Picker
            label="Stock Type"
            value={formData.stock_type}
            onValueChange={(value) => setFormData({ ...formData, stock_type: value })}
            items={stockTypeOptions}
          />

          <TextField
            label="Body Condition Score"
            value={formData.body_condition_score.toString()}
            onChangeText={(text) => setFormData({ ...formData, body_condition_score: parseFloat(text) || 0 })}
            placeholder="Enter BCS (1-5)"
            keyboardType="numeric"
          />

          <TextField
            label="Heat Detection Date"
            value={formData.heat_detection_date}
            onChangeText={(text) => setFormData({ ...formData, heat_detection_date: text })}
            placeholder="YYYY-MM-DD"
          />

          <TextField
            label="Observer"
            value={formData.observer}
            onChangeText={(text) => setFormData({ ...formData, observer: text })}
            placeholder="Enter observer name"
          />

          <TextField
            label="Serviced Date"
            value={formData.serviced_date}
            onChangeText={(text) => setFormData({ ...formData, serviced_date: text })}
            placeholder="YYYY-MM-DD"
          />

          <Picker
            label="Breeding Status"
            value={formData.breeding_status}
            onValueChange={(value) => setFormData({ ...formData, breeding_status: value })}
            items={breedingStatusOptions}
          />

          <Picker
            label="Breeding Method"
            value={formData.breeding_method}
            onValueChange={(value) => setFormData({ ...formData, breeding_method: value })}
            items={breedingMethodOptions}
          />

          {formData.breeding_method === 'artificial_insemination' && (
            <TextField
              label="AI Technician"
              value={formData.ai_technician}
              onChangeText={(text) => setFormData({ ...formData, ai_technician: text })}
              placeholder="Enter AI technician name"
            />
          )}

          <TextField
            label="Sire ID/Straw ID"
            value={formData.sire_id_straw_id}
            onChangeText={(text) => setFormData({ ...formData, sire_id_straw_id: text })}
            placeholder="Enter sire or straw ID"
          />

          <TextField
            label="Semen Viability"
            value={formData.semen_viability}
            onChangeText={(text) => setFormData({ ...formData, semen_viability: text })}
            placeholder="Enter semen viability"
          />

          <TextField
            label="Return to Heat Date 1"
            value={formData.return_to_heat_date_1}
            onChangeText={(text) => setFormData({ ...formData, return_to_heat_date_1: text })}
            placeholder="YYYY-MM-DD"
          />

          <TextField
            label="Date Served"
            value={formData.date_served}
            onChangeText={(text) => setFormData({ ...formData, date_served: text })}
            placeholder="YYYY-MM-DD"
          />

          <Picker
            label="Breeding Method 2"
            value={formData.breeding_method_2}
            onValueChange={(value) => setFormData({ ...formData, breeding_method_2: value })}
            items={breedingMethodOptions}
          />

          <Picker
            label="Sire Used"
            value={formData.sire_used}
            onValueChange={(value) => setFormData({ ...formData, sire_used: value })}
            items={maleAnimalOptions}
          />

          <TextField
            label="Return to Heat Date 2"
            value={formData.return_to_heat_date_2}
            onChangeText={(text) => setFormData({ ...formData, return_to_heat_date_2: text })}
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