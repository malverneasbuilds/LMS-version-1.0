import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Modal, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from '../../typography/Text';
import { TextField } from '../../inputs/TextField';
import { Button } from '../../ui/Button';
import { X } from 'lucide-react-native';
import Colors from '../../../constants/Colors';

interface PregnancyRecord {
  id: string;
  year_number: number;
  prebreeding_bcs: number;
  last_service_date: string;
  first_pd: string;
  second_pd: string;
  third_pd: string;
  gestation_period: number;
  expected_calving_date: string;
  actual_calving_date: string;
}

interface PregnancyRegisterModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (record: Omit<PregnancyRecord, 'id'>) => void;
  editRecord?: PregnancyRecord | null;
}

export function PregnancyRegisterModal({ visible, onClose, onSave, editRecord }: PregnancyRegisterModalProps) {
  const [formData, setFormData] = useState({
    year_number: 1,
    prebreeding_bcs: 0,
    last_service_date: '',
    first_pd: '',
    second_pd: '',
    third_pd: '',
    gestation_period: 0,
    expected_calving_date: '',
    actual_calving_date: '',
  });

  useEffect(() => {
    if (editRecord) {
      setFormData({
        year_number: editRecord.year_number,
        prebreeding_bcs: editRecord.prebreeding_bcs,
        last_service_date: editRecord.last_service_date,
        first_pd: editRecord.first_pd,
        second_pd: editRecord.second_pd,
        third_pd: editRecord.third_pd,
        gestation_period: editRecord.gestation_period,
        expected_calving_date: editRecord.expected_calving_date,
        actual_calving_date: editRecord.actual_calving_date,
      });
    } else {
      setFormData({
        year_number: 1,
        prebreeding_bcs: 0,
        last_service_date: '',
        first_pd: '',
        second_pd: '',
        third_pd: '',
        gestation_period: 0,
        expected_calving_date: '',
        actual_calving_date: '',
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
            {editRecord ? 'Edit Year Record' : 'Add Year Record'}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={Colors.neutral[600]} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <TextField
            label="Year Number"
            value={formData.year_number.toString()}
            onChangeText={(text) => setFormData({ ...formData, year_number: parseInt(text) || 1 })}
            placeholder="Enter year number"
            keyboardType="numeric"
          />

          <TextField
            label="Prebreeding BCS"
            value={formData.prebreeding_bcs.toString()}
            onChangeText={(text) => setFormData({ ...formData, prebreeding_bcs: parseFloat(text) || 0 })}
            placeholder="Enter prebreeding body condition score"
            keyboardType="numeric"
          />

          <TextField
            label="Last Service Date"
            value={formData.last_service_date}
            onChangeText={(text) => setFormData({ ...formData, last_service_date: text })}
            placeholder="YYYY-MM-DD"
          />

          <TextField
            label="1PD (First Pregnancy Diagnosis)"
            value={formData.first_pd}
            onChangeText={(text) => setFormData({ ...formData, first_pd: text })}
            placeholder="YYYY-MM-DD"
          />

          <TextField
            label="2PD (Second Pregnancy Diagnosis)"
            value={formData.second_pd}
            onChangeText={(text) => setFormData({ ...formData, second_pd: text })}
            placeholder="YYYY-MM-DD"
          />

          <TextField
            label="3PD (Third Pregnancy Diagnosis)"
            value={formData.third_pd}
            onChangeText={(text) => setFormData({ ...formData, third_pd: text })}
            placeholder="YYYY-MM-DD"
          />

          <TextField
            label="Gestation Period (days)"
            value={formData.gestation_period.toString()}
            onChangeText={(text) => setFormData({ ...formData, gestation_period: parseInt(text) || 0 })}
            placeholder="Enter gestation period"
            keyboardType="numeric"
          />

          <TextField
            label="Expected Calving Date"
            value={formData.expected_calving_date}
            onChangeText={(text) => setFormData({ ...formData, expected_calving_date: text })}
            placeholder="YYYY-MM-DD"
          />

          <TextField
            label="Actual Calving Date"
            value={formData.actual_calving_date}
            onChangeText={(text) => setFormData({ ...formData, actual_calving_date: text })}
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