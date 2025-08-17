import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Modal, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from '../../typography/Text';
import { TextField } from '../../inputs/TextField';
import { Button } from '../../ui/Button';
import { X } from 'lucide-react-native';
import Colors from '../../../constants/Colors';

interface DrugRecord {
  id: string;
  drug_name: string;
  drug_type: string;
  expiry_date: string;
  pregnancy_safety: string;
  in_stock: boolean;
  cost: number;
  withdrawal_period: number;
}

interface DrugRegisterModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (record: Omit<DrugRecord, 'id'>) => void;
  editRecord?: DrugRecord | null;
}

const pregnancySafetyOptions = [
  { label: 'Safe', value: 'safe' },
  { label: 'Not Safe', value: 'not_safe' },
  { label: 'Use with Caution', value: 'use_with_caution' },
];

export function DrugRegisterModal({ visible, onClose, onSave, editRecord }: DrugRegisterModalProps) {
  const [formData, setFormData] = useState({
    drug_name: '',
    drug_type: '',
    expiry_date: '',
    pregnancy_safety: '',
    in_stock: false,
    cost: 0,
    withdrawal_period: 0,
  });

  useEffect(() => {
    if (editRecord) {
      setFormData({
        drug_name: editRecord.drug_name,
        drug_type: editRecord.drug_type || '',
        expiry_date: editRecord.expiry_date,
        pregnancy_safety: editRecord.pregnancy_safety || '',
        in_stock: editRecord.in_stock || false,
        cost: editRecord.cost || 0,
        withdrawal_period: editRecord.withdrawal_period || 0,
      });
    } else {
      setFormData({
        drug_name: '',
        drug_type: '',
        expiry_date: '',
        pregnancy_safety: '',
        in_stock: false,
        cost: 0,
        withdrawal_period: 0,
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
            {editRecord ? 'Edit Drug Record' : 'Add New Drug'}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={Colors.neutral[600]} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <TextField
            label="Drug Name"
            value={formData.drug_name}
            onChangeText={(text) => setFormData({ ...formData, drug_name: text })}
            placeholder="Enter drug name"
          />

          <TextField
            label="Drug Type"
            value={formData.drug_type}
            onChangeText={(text) => setFormData({ ...formData, drug_type: text })}
            placeholder="Enter drug type"
          />

          <TextField
            label="Expiry Date"
            value={formData.expiry_date}
            onChangeText={(text) => setFormData({ ...formData, expiry_date: text })}
            placeholder="YYYY-MM-DD"
          />

          <Picker
            label="Pregnancy Safety"
            value={formData.pregnancy_safety}
            onValueChange={(value) => setFormData({ ...formData, pregnancy_safety: value })}
            items={pregnancySafetyOptions}
          />

          <TextField
            label="Cost ($)"
            value={formData.cost.toString()}
            onChangeText={(text) => setFormData({ ...formData, cost: parseFloat(text) || 0 })}
            placeholder="Enter cost"
            keyboardType="numeric"
          />

          <TextField
            label="Withdrawal Period (days)"
            value={formData.withdrawal_period.toString()}
            onChangeText={(text) => setFormData({ ...formData, withdrawal_period: parseInt(text) || 0 })}
            placeholder="Enter withdrawal period"
            keyboardType="numeric"
          />

          <View style={styles.checkboxContainer}>
            <Text variant="body2" color="neutral.700" style={styles.checkboxLabel}>
              In Stock
            </Text>
            <TouchableOpacity
              style={[styles.checkbox, formData.in_stock && styles.checkboxChecked]}
              onPress={() => setFormData({ ...formData, in_stock: !formData.in_stock })}
            >
              {formData.in_stock && (
                <Text variant="caption" color="white" weight="bold">
                  ✓
                </Text>
              )}
            </TouchableOpacity>
          </View>
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
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  checkboxLabel: {
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: Colors.neutral[300],
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  checkboxChecked: {
    backgroundColor: Colors.primary[500],
    borderColor: Colors.primary[500],
  },
});